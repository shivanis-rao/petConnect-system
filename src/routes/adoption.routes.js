import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import ROLES from '../middlewares/roles.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationsForShelter,
  getShelterApplicationById,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/Adoption.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/prefill', getAdopterPrefillData);
router.post('/apply/:petId', submitAdoptionApplication);
router.get('/my-applications', getMyApplications);

router.get(
  '/shelter/:shelterId',
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getApplicationsForShelter
);

router.patch(
  '/:applicationId/status',
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  updateApplicationStatus
);

router.get(
  '/shelter/:shelterId/application/:applicationId',
  authorize(ROLES.SHELTER, ROLES.ADMIN),
  getShelterApplicationById
);

router.get('/:applicationId', getApplicationById);

export default router;