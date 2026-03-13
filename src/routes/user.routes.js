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
import { authorize, authorizeOwnerOrAdmin } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";
import { forgotPassword, resetPassword } from "../controllers/Passwordreset.controller.js";

const router = express.Router();

//  Public (no auth needed) 
router.post("/send-otp",        sendOtp);
router.post("/verify-otp",      verifyOtp);
router.post("/register",        createUser);
router.post("/login",           loginUser);
router.post("/refresh-token",   refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Any authenticated user 
router.get(
  "/profile",
  authMiddleware,
  authorize(),                    // any role — just needs to be logged in
  (req, res) => res.json({ message: "Profile data", user: req.user })
);

//  Owner or Admin only 
// User A cannot update User B's profile
router.put(
  "/:id/profile",
  authMiddleware,
  authorizeOwnerOrAdmin(),        
  updateProfile
);

export default router;