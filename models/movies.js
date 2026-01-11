import mongoose from "mongoose";
import slugify from "slugify"; // ✅ npm i slugify

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Fast lookup
    },

    description: {
      type: String,
      required: [true, "Movie description is required"],
      maxlength: [10000, "Description too long"],
      trim: true,
    },

    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },

    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
      index: true, // Useful for filtering upcoming/released movies
    },

    genre: {
      type: [String],
      required: true,
      enum: {
        values: ["Action", "Drama", "Comedy", "Romance", "Thriller", "Horror", "Sci-Fi", "Animation", "Adventure", "Fantasy"],
        message: "{VALUE} is not a valid genre",
      },
      default: ["Drama"],
    },

    language: {
      type: String,
      default: "Hindi",
      enum: ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Punjabi", "Marathi", "Bengali"],
      trim: true,
    },

    poster: {
      type: String, // Cloudinary / AWS URL
      required: [true, "Poster image URL is required"],
    },

    trailerUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+/i, "Please enter a valid trailer URL"],
    },

    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [10, "Rating cannot exceed 10"],
      default: 0,
      set: (val) => Math.round(val * 10) / 10, // Keep 1 decimal place
    },

    totalRatings: {
      type: Number,
      default: 0, // For future average rating calculation
    },

    isReleased: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true, // For soft delete
      select: false, // Hide from normal queries
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false, // Hide admin info unless needed
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ================ INDEXES FOR PERFORMANCE ================
movieSchema.index({ title: "text", description: "text" }); // For search
movieSchema.index({ genre: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ isReleased: 1 });

// ================ PRE-SAVE HOOK: Auto-generate slug ================
movieSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = baseSlug;

    // If duplicate slug possible, append -2, -3 etc. (handled by unique check below)
  }
  next();
});

// ================ HANDLE DUPLICATE SLUG (Unique constraint) ================
movieSchema.post("save", async function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000 && error.keyPattern?.slug) {
    // Extract base slug and append random or count
    const baseSlug = slugify(doc.title, { lower: true, strict: true });
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    doc.slug = `${baseSlug}-${randomSuffix}`;
    await doc.save(); // Retry save
  }
  next(error);
});

// Optional: Better way - find similar slugs and append count
// But above method is simpler and works 99% cases

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;