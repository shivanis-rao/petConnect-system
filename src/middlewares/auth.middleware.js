import jwt from "jsonwebtoken";
import db from "../../models/index.js";
const { User, Shelter } = db;

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Attach basic user info to req.user
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // If user is a shelter, attach shelter info
    if (user.role === "shelter") {
      const shelter = await Shelter.findOne({ where: { owner_id: user.id } });
      req.user.shelter = shelter ? { id: shelter.id, name: shelter.name } : null;
    }

    next();
  } catch (error) {
    // Detailed error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};