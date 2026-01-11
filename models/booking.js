import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // 👤 User (Clerk User ID)
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // 🎬 Movie reference
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    // 🎥 Show reference
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    // 💺 Seat numbers
    seats: [
      {
        type: String, // e.g. A1, A2, B5
        required: true,
      },
    ],

    // 💰 Pricing
    pricePerSeat: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // 💳 Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentId: {
      type: String, // Razorpay / Stripe / etc
    },

    // 📌 Booking status
    bookingStatus: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
