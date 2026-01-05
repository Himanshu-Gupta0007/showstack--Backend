const axios = require("axios");
const Show = require("../models/show.js");
const Movie = require("../models/movies.js");
const slugify = require("slugify");

/**
 * ✅ TMDB Now Playing Shows + Save to DB
 */
exports.getNowPlayingShows = async (req, res) => {
  try {
    const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
    const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

    if (!TMDB_ACCESS_TOKEN || !TMDB_BASE_URL || !ADMIN_USER_ID) {
      return res.status(500).json({
        success: false,
        message: "TMDB credentials or admin user ID missing in .env",
      });
    }

    // 🔹 Fetch from TMDB
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      },
      params: {
        language: "en-US",
        page: 1,
      },
    });

    const movies = response.data.results;

    // 🔹 Save to DB (if not exists)
    for (const m of movies) {
      const exists = await Movie.findOne({ tmdbId: m.id });
      if (!exists) {
        await Movie.create({
          tmdbId: m.id,
          title: m.title,
          slug: slugify(m.title, { lower: true }),
          description: m.overview || "No description available",
          duration: m.runtime || 120, // default 120 if runtime missing
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "",
          releaseDate: m.release_date || Date.now(),
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
    res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
};

/**
 * ✅ Create Show (local DB)
 */
exports.createShow = async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Get All Shows
 */
exports.getAllShows = async (req, res) => {
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
    res.status(500).json({ success: false, message: error.message });
  }
};
