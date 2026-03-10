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

const router = express.Router();

/* PUBLIC BROWSE */
router.get("/browse", browsePets);

/* SHELTER PET MANAGEMENT */
router.post("/", createPet);
router.get("/", getAllPets);

router.get("/:id", getPetById);
router.put("/:id", updatePet);
router.patch("/:id/status", updatePetStatus);
router.delete("/:id", deletePet);

export default router;