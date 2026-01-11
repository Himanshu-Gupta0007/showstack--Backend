import express from "express";
import { requireAuth } from "@clerk/express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  //getAllBookingsAdmin,
} from "../controllers/bookingController.js";


const router = express.Router();

// 🧪 TESTING MODE - Auth temporarily disabled
// 👤 User routes
router.post("/", createBooking);  // ✅ Auth bypass for testing
router.get("/my", getMyBookings);    // ✅ Auth bypass for testing
router.delete("/:bookingId", cancelBooking);  // ✅ Auth bypass for testing

// 👑 Admin route
//router.get("/admin/all", getAllBookingsAdmin);  // ✅ Auth bypass for testing

// 🔒 PRODUCTION MODE - Uncomment these and comment above routes when deploying
// router.post("/add", requireAuth(), createBooking);
// router.get("/my", requireAuth(), getMyBookings);
// router.delete("/:bookingId", requireAuth(), cancelBooking);
// router.get("/admin/all", requireAuth(), getAllBookingsAdmin);

export default router;