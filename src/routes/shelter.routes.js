import express from "express";

import {
  // getAllShelters,
  getShelterById,
} from "../controllers/shelter.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as shelterController from "../controllers/shelter.controller.js";
import upload from "../middlewares/upload.js";
import { authorize, authorizeShelterOwner } from "../middlewares/rbac.middleware.js";
import ROLES from "../middlewares/roles.js";

const router = express.Router();

// Public 
// router.get("/",    getAllShelters);
router.get("/:id", getShelterById);

// Shelter owner + Admin
// Add these when you build the shelter update/file controllers
// router.delete(
//   "/:shelterId",
//   authMiddleware,
//   authorize(ROLES.ADMIN),
//   deleteShelter
// );
// router.put(
//   "/:shelterId",
//   authMiddleware,
//   authorizeShelterOwner(),       // uses req.user.shelter.id
//   updateShelter
// );

// router.post(
//   "/:shelterId/files",
//   authMiddleware,
//   authorizeShelterOwner(),
//   uploadShelterFiles
// );

// Admin only 
// router.patch(
//   "/:shelterId/verify",
//   authMiddleware,
//   authorize(ROLES.ADMIN),
//   verifyShelter
// );

// router.delete(
//   "/:shelterId",
//   authMiddleware,
//   authorize(ROLES.ADMIN),
//   deleteShelter
// );




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
