import express from "express";
import * as shelterController from "../controllers/shelter.controller.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Get shelter by ID(optional)
router.get("/:id", shelterController.getShelterById);

router.post(
  "/ngo_register",
  authMiddleware,
  upload.fields([
    { name: "registration_certificate", maxCount: 1 },
    { name: "additional_document", maxCount: 5 },
  ]),
  shelterController.createNgoShelter,
);
export default router;
