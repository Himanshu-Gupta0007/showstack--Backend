import mongoose from "mongoose";
import Booking from "../models/booking.js";
import Show from "../models/show.js";
import Movie from "../models/movies.js";

/**
 * ✅ CREATE BOOKING (Movie se, Show auto-create)
 */
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.auth?.userId || "test-user-123";
    const { movieId, showDate, showTime, seats, pricePerSeat } = req.body;

    // 🔴 Validation
    if (!movieId || !showTime || !showDate || !Array.isArray(seats) || seats.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "movieId, showDate, showTime aur seats required hain",
      });
    }

    // Convert showDate to Date object
    const showDateObj = new Date(showDate);

    // 🎬 Movie check
    const movie = await Movie.findById(movieId).session(session);
    if (!movie) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Movie nahi mili",
      });
    }

    // 🎟️ Show find (movie + date + time)
    let show = await Show.findOne({
      movie: movieId,
      showDate: showDateObj,
      showTime,
    }).session(session);

    // ➕ Show create agar nahi mila
    if (!show) {
      show = await Show.create(
        [
          {
            movie: movieId,
            showDate: showDateObj,
            showTime,
            totalSeats: 100,
            availableSeats: 100,
            bookedSeats: [],
            price: pricePerSeat || 250,
          },
        ],
        { session }
      );
      show = show[0];
    }

    // ❌ Seat already booked?
    const alreadyBooked = seats.filter(seat => show.bookedSeats.includes(seat));

    if (alreadyBooked.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Ye seats pehle se booked hain: ${alreadyBooked.join(", ")}`,
      });
    }

    // ❌ Availability check
    if (show.availableSeats < seats.length) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Sirf ${show.availableSeats} seats available hain`,
      });
    }

    // 💰 Price
    const finalPrice = Number(pricePerSeat) || Number(show.price) || 250;
    const totalAmount = finalPrice * seats.length;

    // 🔒 Lock seats
    show.bookedSeats.push(...seats);
    show.availableSeats -= seats.length;
    await show.save({ session });

    // 🧾 Booking create
    const booking = await Booking.create(
      [
        {
          userId,
          movie: movieId,
          show: show._id,
          seats,
          showDate: showDateObj, // ✅ include showDate in booking
          showTime,
          pricePerSeat: finalPrice,
          totalAmount,
          bookingStatus: "booked",
          paymentStatus: "paid",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const finalBooking = await Booking.findById(booking[0]._id)
      .populate("movie", "title poster")
      .populate("show", "showDate showTime price")
      .lean();

    return res.status(201).json({
      success: true,
      message: "🎉 Booking successful",
      data: finalBooking,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Booking fail ho gayi",
    });
  } finally {
    session.endSession();
  }
};

/**
 * ✅ USER BOOKINGS
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.auth?.userId || "test-user-123";

    const bookings = await Booking.find({ userId })
      .populate("movie", "title poster")
      .populate("show", "showDate showTime price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Bookings nahi mil rahi",
    });
  }
};

/**
 * ❌ CANCEL BOOKING
 */
export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const userId = req.auth?.userId || "test-user-123";

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Booking nahi mili" });
    }

    if (booking.userId !== userId) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.bookingStatus === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Already cancelled" });
    }

    await Show.findByIdAndUpdate(
      booking.show,
      {
        $inc: { availableSeats: booking.seats.length },
        $pullAll: { bookedSeats: booking.seats },
      },
      { session }
    );

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "failed";
    await booking.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Booking cancel ho gayi",
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      success: false,
      message: "Cancel fail",
    });
  } finally {
    session.endSession();
  }
};
