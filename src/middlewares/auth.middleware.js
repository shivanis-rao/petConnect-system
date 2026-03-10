import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user info to request

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });

  }
};