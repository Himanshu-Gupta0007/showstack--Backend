const express = require("express");
const router = express.Router();

// Controller import
const showController = require("../controllers/showController.js");

// TMDB Now Playing Movies
router.get("/now-playing", showController.getNowPlayingShows);

// Local DB Shows CRUD
router.post("/add", showController.createShow);
router.get("/", showController.getAllShows);

module.exports = router;
