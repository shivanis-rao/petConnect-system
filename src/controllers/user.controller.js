import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import { sendOtpEmail } from "../../utils/mailer.js";

const { User, Shelter, OtpStore } = db;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await OtpStore.destroy({ where: { email } });
    await OtpStore.create({ email, otp, expires_at, is_verified: false });

    const previewUrl = await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      dev: { otp, previewUrl },
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await OtpStore.findOne({ where: { email } });
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new one",
      });
    }

    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one",
      });
    }

    if (String(otpRecord.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await otpRecord.update({ is_verified: true });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      confirmPassword,
      role = "adopter",
    } = req.body;

    if (!firstName || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Check OTP was verified
    const otpRecord = await OtpStore.findOne({ where: { email } });
    if (!otpRecord || !otpRecord.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Please verify your email first" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      phone: phoneNumber,
      email,
      password: hashedPassword,
      role,
      email_verified: true,
      account_status: "Active",
    });

    await OtpStore.destroy({ where: { email } });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      location,
      living_situation,
      preferred_species,
      pet_experience_years,
      profile_completed,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.update({
      location,
      living_situation,
      preferred_species,
      pet_experience_years,
      profile_completed: profile_completed || true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        location: user.location,
        living_situation: user.living_situation,
        preferred_species: user.preferred_species,
        pet_experience_years: user.pet_experience_years,
        profile_completed: user.profile_completed,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
          shelter: shelterData,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};
