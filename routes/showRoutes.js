import express from "express";
import {
  createShow,
  getNowPlayingShows,
  getAllShows,
   getShowsByMovieId
} from "../controllers/showController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 ADMIN ONLY
router.post("/add", createShow);
router.get("/now-playing",  getNowPlayingShows);



// 🌍 PUBLIC
router.get("/", getAllShows);
// 🎯 movieId se shows lao
router.get("/movie/:movieId", getShowsByMovieId);

export default router;
