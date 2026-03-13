import express from "express";

import {
  getAllShelters,
  getShelterById,
} from "../controllers/shelter.controller.js";

import { authMiddleware }                              from "../middlewares/auth.middleware.js";
import { authorize, authorizeShelterOwner }            from "../middlewares/rbac.middleware.js";
import ROLES                                           from "../middlewares/roles.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────────────
router.get("/",    getAllShelters);
router.get("/:id", getShelterById);

// ── Shelter owner + Admin ──────────────────────────────────────────────────────
// Add these when you build the shelter update/file controllers
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

// ── Admin only ─────────────────────────────────────────────────────────────────
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

export default router;
