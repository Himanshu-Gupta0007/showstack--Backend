import express from "express";
import { getAuth } from "@clerk/express"; // Optional helper (req.auth works too)
import { syncUser } from "../controllers/userController.js";

const router = express.Router();

// Protected route: requires authentication
router.post("/sync", (req, res, next) => {
  const auth = getAuth(req); // or directly: const { userId } = req.auth;

  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Attach userId to request for the controller if needed
  req.userId = auth.userId;
  next();
}, syncUser);

export default router;