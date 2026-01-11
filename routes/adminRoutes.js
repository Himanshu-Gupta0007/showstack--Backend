import express from "express";
import {
  getDashboardStats,
  getAllBookings,
  getAllShowsAdmin,
  cancelAnyBooking,
  makeUserAdmin,
  getAdminProfile,
} from "../controllers/adminController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// 🔐 TEMPORARILY COMMENT THIS OUT TO TEST
// router.use(requireAuth);

// Admin Dashboard
router.get("/dashboard", getDashboardStats);

// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:bookingId/cancel", cancelAnyBooking);

// Shows
router.get("/shows", getAllShowsAdmin);

// Make Admin
router.post("/make-user-admin/:userId", makeUserAdmin);

// Admin Profile
router.get("/profile", getAdminProfile);

export default router;