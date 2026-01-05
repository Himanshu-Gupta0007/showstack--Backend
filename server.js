import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import { inngest, functions } from "./Inngest/index.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/shows", showRoutes);

app.get("/", (req, res) => {
  res.send("Backend running smoothly! 🚀");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

// ❌ NO app.listen
export default app;
