import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../models/index.js";

const { User, Shelter } = db;

/*
CREATE USER (REGISTER)
*/
export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validation
    if (!first_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email and password are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: `${user.first_name} ${user.last_name || ""}`.trim(),
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Create User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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