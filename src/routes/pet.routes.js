import express from "express";

import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  updatePetStatus,
  deletePet,
  browsePets,
} from "../controllers/pet.controller.js";

import { authMiddleware }     from "../middlewares/auth.middleware.js";
import { authorize }          from "../middlewares/rbac.middleware.js";
import ROLES                  from "../middlewares/roles.js";

const router = express.Router();

// ── Public (no auth needed) ───────────────────────────────────────────────────
router.get("/browse",     browsePets);
router.get("/public/:id", getPetById);

// ── Shelter + Admin only ──────────────────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  createPet
);

router.get(
  "/",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getAllPets
);

router.get(
  "/:id",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getPetById
);

router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  updatePet
);

router.patch(
  "/:id/status",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  updatePetStatus
);

router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  deletePet
);

export default router;