import express from "express";
import showController from "../controllers/showController.js";

const router = express.Router();

// TMDB Now Playing Movies
router.get("/now-playing", showController.getNowPlayingShows);

// Local DB Shows CRUD
router.post("/add", showController.createShow);
router.get("/", showController.getAllShows);

export default router; // ✅ Default export
