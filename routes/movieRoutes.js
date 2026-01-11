import express from "express";
import movieController from "../controllers/movieController.js";

const router = express.Router();

// ✅ GET all movies
router.get("/", movieController.getAllMovies);

// ✅ GET movie by ID
router.get("/:id", movieController.getMovieById);

export default router;
