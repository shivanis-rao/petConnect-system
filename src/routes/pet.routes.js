import express from "express";

import {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  updatePetStatus,
  deletePet
} from "../controllers/pet.controller.js";

const router = express.Router();

/*
CREATE PET
*/
router.post("/", createPet);

/*
GET ALL PETS
*/
router.get("/", getAllPets);

/*
GET PET BY ID
*/
router.get("/:id", getPetById);

/*
UPDATE PET
*/
router.put("/:id", updatePet);

/*
UPDATE STATUS
*/
router.patch("/:id/status", updatePetStatus);

/*
DELETE PET
*/
router.delete("/:id", deletePet);

export default router;