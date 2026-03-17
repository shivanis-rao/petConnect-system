import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createRequest,
  getMyRequests,
  getShelterRequests,
  getRequestById,
  updateRequestStatus,
} from "../controllers/adoptionRequest.controller.js";

const router = express.Router();

// Adopter routes
router.post("/", authMiddleware, createRequest);
router.get("/my", authMiddleware, getMyRequests);

// Shelter routes
router.get("/shelter", authMiddleware, getShelterRequests);

// Shared
router.get("/:id", authMiddleware, getRequestById);
router.patch("/:id/status", authMiddleware, updateRequestStatus);

export default router;
