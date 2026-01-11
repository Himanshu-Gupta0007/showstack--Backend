import axios from "axios";
import Show from "../models/show.js";
import Movie from "../models/movies.js";
import slugify from "slugify";

/**
 * TMDB Now Playing Shows + Save to DB
 */
export const getNowPlayingShows = async (req, res) => {
  try {
    // ✅ Read env inside function to avoid undefined issue
    const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

    console.log("TOKEN =", TMDB_ACCESS_TOKEN);
    console.log("BASE =", TMDB_BASE_URL);
    console.log("ADMIN =", ADMIN_USER_ID);

    if (!TMDB_ACCESS_TOKEN || !TMDB_BASE_URL || !ADMIN_USER_ID) {
      return res.status(500).json({
        success: false,
        message: "TMDB credentials or admin user ID missing in .env",
      });
    }

    // Fetch from TMDB
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
      params: { language: "en-US", page: 1 },
    });

    const movies = response.data.results;

    // Save movies to DB (upsert style)
    for (const m of movies) {
      const exists = await Movie.findOne({ tmdbId: m.id });
      if (!exists) {
        await Movie.create({
          tmdbId: m.id,
          title: m.title,
          slug: slugify(`${m.title}-${m.id}`, { lower: true }), // avoid duplicate slugs
          description: m.overview || "No description available",
          duration: 120, // runtime not available in /now_playing
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "",
          releaseDate: m.release_date ? new Date(m.release_date) : new Date(),
          createdBy: ADMIN_USER_ID,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
};

/**
 * Create Show (local DB)
 */
export const createShow = async (req, res) => {
  try {
    const { movie, showDate, showTime, price, totalSeats } = req.body;

    const movieExists = await Movie.findById(movie);
    if (!movieExists)
      return res.status(404).json({ success: false, message: "Movie not found" });

    const show = await Show.create({
      movie,
      showDate,
      showTime,
      price,
      totalSeats,
      availableSeats: totalSeats,
    });

    res.status(201).json({
      success: true,
      message: "Show created successfully",
      data: show,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Shows
 */
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie", "title poster duration")
      .sort({ showDate: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};







export const getShowsByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;

    // 🔍 check movie exists or not
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // 🎬 shows find by movie id
    const shows = await Show.find({ movie: movieId, isActive: true })
      .populate("movie", "title poster duration")
      .sort({ showDate: 1, showTime: 1 });

    return res.status(200).json({
      success: true,
      movie,
      totalShows: shows.length,
      data: shows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shows by movie",
    });
  }
};








// ✅ Default export for ES module
export default {
  getNowPlayingShows,
  createShow,
  getAllShows,
  getShowsByMovieId
};
