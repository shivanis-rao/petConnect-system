import express from "express";

import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  updatePetStatus,
  deletePet,
  browsePets,
  getAnalytics,
} from "../controllers/pet.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* PUBLIC - Browse Pets (no auth needed) */
router.get("/browse", browsePets);
router.get("/public/:id", getPetById);

/* SHELTER PET MANAGEMENT - AUTH REQUIRED */
router.post("/", authMiddleware, createPet); // CREATE PET
router.get("/", authMiddleware, getAllPets); // GET ALL PETS FOR SHELTER
router.get("/analytics", authMiddleware, getAnalytics); // GET ANALYTICS
router.get("/:id", authMiddleware, getPetById); // GET PET BY ID
router.put("/:id", authMiddleware, updatePet); // UPDATE PET
router.patch("/:id/status", authMiddleware, updatePetStatus); // UPDATE STATUS
router.delete("/:id", authMiddleware, deletePet); // DELETE PET

export default router;
