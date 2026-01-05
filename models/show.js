import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    showDate: {
      type: Date, // sirf date (YYYY-MM-DD)
      required: true,
    },

    showTime: {
      type: String, // "10:30 AM", "07:45 PM"
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Show = mongoose.model("Show", showSchema);

export default Show; // ✅ Default export for ES module
