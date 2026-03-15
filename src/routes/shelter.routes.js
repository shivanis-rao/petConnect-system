import express from "express";

import * as shelterController from "../controllers/shelter.controller.js";
import upload from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
// import { authorize, authorizeShelterOwner } from "../middlewares/rbac.middleware.js";
// import ROLES from "../middlewares/roles.js";

const router = express.Router();

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

// Public
// router.get("/",  shelterController.getAllShelters);
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

router.post(
    "/government_register",
    upload.single("government_authorization"),
    shelterController.createGovernmentDetails

)

router.post(
    "/rescuer_register",shelterController.createShelterRescuer)

   

export default router;
