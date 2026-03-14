import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import ROLES from"../middlewares/roles.js";
import { authorize } from '../middlewares/rbac.middleware.js';
const router = express.Router();
import {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationsForShelter,
  updateApplicationStatus,
} from '../controllers/Adoption.controller.js';


// All routes require authentication
router.use(authMiddleware);

// GET /adoption/prefill — fetch logged-in user's auto-fill data (name, phone, email, experience)
router.get('/prefill', getAdopterPrefillData);

// GET /adoption/my-applications — user sees their own applications
router.get('/my-applications', getMyApplications);

// POST /adoption/apply/:petId — user submits adoption application
router.post('/apply/:petId', submitAdoptionApplication);

// GET /adoption/shelter/:shelterId — NGO/shelter views applications for their pets
router.get(
  '/shelter/:shelterId',
  authorize([ROLES.NGO, ROLES.ADMIN]),
  getApplicationsForShelter
);

// PATCH /adoption/:applicationId/status — NGO/shelter approves or rejects
router.patch(
  '/:applicationId/status',
  authorize([ROLES.NGO, ROLES.ADMIN]),
  updateApplicationStatus
);

export default router;