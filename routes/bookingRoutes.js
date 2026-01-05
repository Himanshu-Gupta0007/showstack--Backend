const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getBookings,
  addBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", protect, getBookings);
router.post("/", protect, addBooking);

module.exports = router;
