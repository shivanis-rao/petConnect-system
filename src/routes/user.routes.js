import express from "express";
import { createUser, loginUser, sendOtp, verifyOtp } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/send-otp",  sendOtp);
router.post("/verify-otp",verifyOtp);
router.post("/login", loginUser);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Profile data",
    user: req.user
  });
});

export default router;