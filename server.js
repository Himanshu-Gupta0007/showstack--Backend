import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express"; 
import { serve } from "inngest/express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import showRoutes from "./routes/showRoutes.js"; // ✅ Show routes import
import { inngest, functions } from "./Inngest/index.js";

dotenv.config();
connectDB();

const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/shows", showRoutes); // ✅ Now-playing route active

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("Backend running smoothly! 🚀");
});

// 🔹 Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// 🔹 Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
