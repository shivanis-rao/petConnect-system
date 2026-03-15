import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import ROLES from "../middlewares/roles.js";
import { authorize } from "../middlewares/rbac.middleware.js";
const router = express.Router();
import {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationsForShelter,
  getShelterApplicationById,
  updateApplicationStatus,
  getApplicationById,
} from "../controllers/Adoption.controller.js";

// All routes require authentication
router.use(authMiddleware);

// GET /adoption/prefill — fetch logged-in user's auto-fill data (name, phone, email, experience)
router.get("/prefill", getAdopterPrefillData);

// POST /adoption/apply/:petId — user submits adoption application
router.post("/apply/:petId", submitAdoptionApplication);

// GET /adoption/my-applications — user sees their own applications
router.get("/my-applications", getMyApplications);

// GET /adoption/shelter/:shelterId — NGO/shelter views applications for their pets
router.get(
  "/shelter/:shelterId",
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getApplicationsForShelter,
);

// PATCH /adoption/:applicationId/status — NGO/shelter approves or rejects
router.patch(
  "/:applicationId/status",
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  updateApplicationStatus,
);

// Add this route — BEFORE /:applicationId to avoid conflicts
router.get(
  "/shelter/:shelterId/application/:applicationId",
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getShelterApplicationById,
);

router.get("/:applicationId", getApplicationById);

export default router;
