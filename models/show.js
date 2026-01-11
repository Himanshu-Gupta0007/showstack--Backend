import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie ID is required"],
      index: true,
    },
    showDate: {
      type: Date,
      required: [true, "Show date is required"],
    },
    showTime: {
      type: String,
      required: [true, "Show time is required"],
      trim: true,
      // We will store only in "10:30 AM" format
      set: function (value) {
        if (!value) return value;

        // Normalize input: remove extra spaces, make uppercase for AM/PM
        value = value.trim().toUpperCase();

        // Match 24-hour format: 09:15, 9:30, 18:45, 23:59
        const match24 = value.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
        if (match24) {
          let hour = parseInt(match24[1], 10);
          const minute = match24[2];
          const ampm = hour >= 12 ? "PM" : "AM";
          hour = hour % 12 || 12; // 0 -> 12, 13 -> 1, etc.
          return `${hour}:${minute} ${ampm}`;
        }

        // If already in AM/PM format, just clean it
        const match12 = value.match(/^(\d{1,2}):([0-5][0-9])\s*(AM|PM)$/);
        if (match12) {
          let hour = parseInt(match12[1], 10);
          const minute = match12[2];
          const ampm = match12[3];
          if (hour >= 1 && hour <= 12) {
            hour = hour === 12 && ampm === "AM" ? 0 : hour; // optional normalization
            hour = hour === 0 ? 12 : hour;
            return `${hour}:${minute} ${ampm}`;
          }
        }

        // If nothing matches, return original (validation will fail)
        return value;
      },
      validate: {
        validator: function (v) {
          return /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time! Expected format: "10:30 AM" or "7:45 PM"`,
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats are required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats are required"],
      min: [0, "Available seats cannot be negative"],
      validate: {
        validator: function (v) {
          return v <= this.totalSeats;
        },
        message: "Available seats cannot exceed total seats",
      },
    },
    bookedSeats: {
      type: [String], // e.g., ["A1", "A2", "B5"]
      default: [],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique show per movie, date, and time
showSchema.index({ movie: 1, showDate: 1, showTime: 1 }, { unique: true });

// Optional: Index for faster queries by date and active status
showSchema.index({ showDate: 1, isActive: 1 });

const Show = mongoose.model("Show", showSchema);

export default Show;