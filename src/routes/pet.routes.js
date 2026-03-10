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

router.post("/", createPet);

router.get("/", getAllPets);

/* BROWSE ROUTE MUST COME BEFORE :id */
router.get("/browse", browsePets);

router.get("/:id", getPetById);

router.put("/:id", updatePet);

router.patch("/:id/status", updatePetStatus);

router.delete("/:id", deletePet);

export default router;