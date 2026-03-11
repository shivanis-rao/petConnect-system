import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";

const { User, Shelter } = db;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
export const createUser = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, password,
      location, living_situation, pet_experience_years, preferred_species,
    } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      first_name, last_name, email, phone,
      password: hashedPassword,
      location, living_situation, pet_experience_years, preferred_species,
      otp,
      otp_expires_at,
      email_verified: false,
      account_status: "Pending",
    });

    await sendOtpEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for the OTP.",
      data: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("❌ Create User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// RESEND OTP  →  POST /api/users/send-otp
// ─────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otp_expires_at });
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });

  } catch (error) {
    console.error("❌ Send OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// VERIFY OTP  →  POST /api/users/verify-otp
// ─────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    // ✅ Expiry check FIRST
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // ✅ String coercion prevents type mismatch
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await user.update({
      email_verified: true,
      account_status: "Active",
      otp: null,
      otp_expires_at: null,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });

  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/*
LOGIN USER
*/
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Access Token
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Refresh Token
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Attach shelter info if user is shelter
    let shelterData = null;
    if (user.role === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      shelterData = shelter ? { id: shelter.id, name: shelter.name } : null;
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          email: user.email,
          role: user.role,
          shelter: shelterData
        }
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};