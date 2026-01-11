import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express"; 
import { serve } from "inngest/express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { inngest, functions } from "./Inngest/index.js";

dotenv.config();

// 🔹 MongoDB connect
connectDB();

const app = express();

// 🔹 CORS setup
const corsOptions = {
  origin: [
    "http://localhost:5173", // React frontend
    "http://localhost:5000", // backend server if needed
    "https://your-production-domain.com", // production
  ],
  credentials: true, // cookies & headers allow karne ke liye
};
app.use(cors(corsOptions));

// 🔹 Body parser
app.use(express.json());

// 🔹 Clerk middleware for authentication
app.use(clerkMiddleware());

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("Backend running smoothly! 🚀");
});

// 🔹 Inngest endpoint with signing key
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  })
);

// 🔹 Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  