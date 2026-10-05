import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected user profile
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user
  });
});

// Admin-only protected route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: req.user
  });
});

export default router;
