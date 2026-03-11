import express from "express";

import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  updatePetStatus,
  deletePet,
  browsePets
} from "../controllers/pet.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js"; // Make sure path is correct

const router = express.Router();

/* PUBLIC - Browse Pets (no auth needed) */
router.get("/browse", browsePets);

/* SHELTER PET MANAGEMENT - AUTH REQUIRED */
router.post("/", authMiddleware, createPet);          // CREATE PET
router.get("/", authMiddleware, getAllPets);         // GET ALL PETS FOR SHELTER
router.get("/:id", authMiddleware, getPetById);      // GET PET BY ID
router.put("/:id", authMiddleware, updatePet);       // UPDATE PET
router.patch("/:id/status", authMiddleware, updatePetStatus); // UPDATE STATUS
router.delete("/:id", authMiddleware, deletePet);    // DELETE PET

export default router;