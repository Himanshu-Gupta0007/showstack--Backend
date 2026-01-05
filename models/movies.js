const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },

    duration: {
      type: Number, // minutes
      required: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    genre: [
      {
        type: String,
        enum: ["Action", "Drama", "Comedy", "Romance", "Thriller", "Horror", "Sci-Fi"],
      },
    ],

    language: {
      type: String,
      default: "Hindi",
    },

    poster: {
      type: String, // image URL
      required: true,
    },

    trailerUrl: {
      type: String,
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    isReleased: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Movie", movieSchema);
