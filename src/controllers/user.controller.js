// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import db from "../../models/index.js";
// import { sendOtpEmail } from "../../utils/mailer.js";

// const User = db.User;

// const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// // CREATE USER
// export const createUser = async (req, res) => {
//   try {
//     const {
//       first_name, last_name, email, phone, password,
//       location, living_situation, pet_experience_years, preferred_species
//     } = req.body;

//     if (!first_name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "First name, email and password are required"
//       });
//     }

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOtp();
//     const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

//     const user = await User.create({
//       first_name, last_name, email, phone,
//       password: hashedPassword,
//       location, living_situation, pet_experience_years, preferred_species,
//       otp,
//       otp_expires_at,
//       email_verified: false,
//       account_status: "Pending"
//     });

//     await sendOtpEmail(email, otp);

//     return res.status(201).json({
//       success: true,
//       message: "User created. OTP sent to email.",
//       data: {
//         id: user.id,
//         email: user.email
//       }
//     });

//   } catch (error) {
//     console.error("Create User Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // SEND OTP (resend)
// export const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (user.email_verified) {
//       return res.status(400).json({ success: false, message: "Email already verified" });
//     }

//     const otp = generateOtp();
//     const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

//     await user.update({ otp, otp_expires_at });
//     await sendOtpEmail(email, otp);

//     return res.status(200).json({ success: true, message: "OTP resent successfully" });

//   } catch (error) {
//     console.error("Send OTP Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // VERIFY OTP
// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     if (user.email_verified) {
//       return res.status(400).json({ success: false, message: "Email already verified" });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     if (new Date() > user.otp_expires_at) {
//       return res.status(400).json({ success: false, message: "OTP expired" });
//     }

//     await user.update({
//       email_verified: true,
//       account_status: "Active",
//       otp: null,
//       otp_expires_at: null
//     });

//     return res.status(200).json({ success: true, message: "Email verified successfully" });

//   } catch (error) {
//     console.error("Verify OTP Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // LOGIN (unchanged)
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Block login if not verified
//     if (!user.email_verified) {
//       return res.status(403).json({ success: false, message: "Please verify your email first" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Invalid password" });
//     }

//     const accessToken = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     const refreshToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       data: {
//         accessToken,
//         refreshToken,
//         user: {
//           id: user.id,
//           name: `${user.first_name} ${user.last_name || ""}`.trim(),
//           email: user.email,
//           role: user.role
//         }
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Login failed", error: error.message });
//   }
// };

//previewURL
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";
import { sendOtpEmail } from "../../utils/mailer.js";

const User = db.User;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, password,
      location, living_situation, pet_experience_years, preferred_species
    } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      first_name, last_name, email, phone,
      password: hashedPassword,
      location, living_situation, pet_experience_years, preferred_species,
      otp,
      otp_expires_at,
      email_verified: false,
      account_status: "Pending"
    });

    const previewUrl = await sendOtpEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "User created. OTP sent to email.",
      data: {
        id: user.id,
        email: user.email,
        otp: otp,                     // 👈 remove this in production
        otp_preview_url: previewUrl   // 👈 remove this in production
      }
    });

  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// SEND OTP (resend)
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

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
    const previewUrl = await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        otp: otp,                     // 👈 remove this in production
        otp_preview_url: previewUrl   // 👈 remove this in production
      }
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await user.update({
      email_verified: true,
      account_status: "Active",
      otp: null,
      otp_expires_at: null
    });

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// LOGIN (unchanged)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Block login if not verified
    if (!user.email_verified) {
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
          role: user.role
        }
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};