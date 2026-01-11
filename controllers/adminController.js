import Booking from "../models/booking.js";
import Show from "../models/show.js";
import Movie from "../models/movies.js";
import User from "../models/user.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

/* =====================================================
   🔐 ADMIN CHECK HELPER (FIXED!)
===================================================== */
const isAdmin = async (req) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return false;

    // 👇 TEMPORARY HARD CODE — Tera ID ko hamesha admin allow kar dega
    if (userId === "user_37q89ksJaahIGk679GMDyAGIJta") {
    //  console.log("🔥 Hardcoded Admin Access Granted for Himanshu!");
      return true;
    }

    // Normal check for baaki users (privateMetadata se)
    const user = await clerkClient.users.getUser(userId);
    const role = user.privateMetadata?.role || "user";

    return role === "admin";
  } catch (err) {
    console.error("🔒 Admin check error:", err.message);
    return false;
  }
};

/* =====================================================
   📊 MAIN ADMIN DASHBOARD
===================================================== */
export const getDashboardStats = async (req, res) => {
  //console.log("✅ Dashboard API HIT");

  // Timeout set karo (30 seconds)
  req.setTimeout(30000);

  try {
    // isAdmin check mein bhi timeout
    const adminCheck = await Promise.race([
      isAdmin(req),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin check timeout')), 5000)
      )
    ]);

    if (!adminCheck) {
      return res.status(403).json({
        success: false,
        message: "❌ Access denied. Admin only!",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Individual timeout for each query
    const queryTimeout = 10000; // 10 seconds

    const [
      totalBookings,
      totalRevenueResult,
      totalUsers,
      activeShows,
      totalMovies,
      recentBookings,
    ] = await Promise.all([
      Promise.race([
        Booking.countDocuments(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Booking count timeout')), queryTimeout))
      ]),
      
      Promise.race([
        Booking.aggregate([
          { $match: { status: { $nin: ["cancelled", "failed"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Revenue aggregate timeout')), queryTimeout))
      ]),

      Promise.race([
        User.countDocuments(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('User count timeout')), queryTimeout))
      ]),

      Promise.race([
        Show.find({ showDate: { $gte: today } })
          .populate("movie", "title poster rating")
          .sort({ showDate: 1, showTime: 1 })
          .limit(50) // Limit add karo
          .lean(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Active shows timeout')), queryTimeout))
      ]),

      Promise.race([
        Movie.countDocuments(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Movie count timeout')), queryTimeout))
      ]),

      Promise.race([
        Booking.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate({
            path: "show",
            populate: { path: "movie", select: "title poster" },
          })
          .lean(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Recent bookings timeout')), queryTimeout))
      ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const recentActivity = recentBookings.map((booking) => ({
      icon: "🎟️",
      title: "New Booking",
      description: `${booking.seats?.length || 1} ticket(s) booked for ₹${booking.amount}`,
      movie: booking.show?.movie?.title || "Unknown Movie",
      poster: booking.show?.movie?.poster || "https://via.placeholder.com/100x150?text=No+Poster",
      time: new Date(booking.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      status: booking.status,
    }));

    const activeShowsList = activeShows.map((show) => {
      const bookedSeats = show.bookedSeats?.length || 0;
      const totalSeats = show.totalSeats || 200;

      return {
        _id: show._id,
        movieTitle: show.movie?.title || "Unknown",
        poster: show.movie?.poster,
        rating: show.movie?.rating || "N/A",
        price: show.price || 0,
        showDate: show.showDate,
        showTime: show.showTime,
        screen: show.screen || "Main Hall",
        bookedSeats,
        totalSeats,
        occupancy: Math.round((bookedSeats / totalSeats) * 100),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        overview: [
          { title: "Total Bookings", value: totalBookings, icon: "🎟️" },
          { title: "Total Users", value: totalUsers, icon: "👥" },
          { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: "💰" },
          { title: "Active Shows", value: activeShows.length, icon: "🎬" },
          { title: "Total Movies", value: totalMovies, icon: "🍿" },
        ],
        activeShows: activeShowsList,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("📊 Dashboard error:", error);
    console.error("Error stack:", error.stack); // Detailed error
    
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message,
    });
  }
};

// Baaki sab controllers mein bhi sirf isAdmin check change kar dena

export const getAllBookings = async (req, res) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ success: false, message: "❌ Admin only!" });
    }

    const bookings = await Booking.find()
      .populate({
        path: "show",
        populate: { path: "movie", select: "title poster duration rating" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("🎟️ All bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShowsAdmin = async (req, res) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ success: false, message: "❌ Admin only!" });
    }

    const shows = await Show.find()
      .populate("movie", "title poster duration rating")
      .sort({ showDate: 1, showTime: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    console.error("🎬 Shows error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAnyBooking = async (req, res) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ success: false, message: "❌ Admin only!" });
    }

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.auth?.userId;
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const makeUserAdmin = async (req, res) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ success: false, message: "❌ Admin only!" });
    }

    const { userId } = req.params;

    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        role: "admin",  // ✅ Ab sahi "admin" set ho raha hai
        updatedBy: req.auth?.userId,
        updatedAt: new Date().toISOString(),
      },
    });

    res.status(200).json({
      success: true,
      message: "User successfully promoted to Admin 👑",
    });
  } catch (error) {
    console.error("👑 Make admin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    if (!(await isAdmin(req))) {
      return res.status(403).json({ success: false, message: "❌ Admin only!" });
    }

    const { userId } = req.auth || {};
    const user = await clerkClient.users.getUser(userId);

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin";

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: fullName,
        email: user.emailAddresses[0]?.emailAddress || "N/A",
        image: user.imageUrl,
        role: user.privateMetadata?.role || "admin",
      },
    });
  } catch (error) {
    console.error("👤 Admin profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};