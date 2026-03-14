import express from "express";
import {
  createUser,
  loginUser,
  sendOtp,
  verifyOtp,
  updateProfile,
  refreshToken,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/Passwordreset.controller.js";

const router = express.Router();

//  Public (no auth needed)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// PROFILE ROUTES
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Profile data",
    user: req.user,
  });
});
router.put("/:id/profile", authMiddleware, updateProfile);

export default router;
