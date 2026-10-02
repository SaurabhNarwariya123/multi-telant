import express from 'express';
import {
  getAgencies,
  getAgencyDetail,
  getAgencyStats,
  getPlatformActivity,
  postAgency,
  postSupportSession,
  updateAgencyStatus,
} from '../controllers/agencyController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const superAdminOnly = [protect, allow('superadmin')];

router.get('/', superAdminOnly, getAgencies);
router.post('/', superAdminOnly, postAgency);
router.get('/stats', superAdminOnly, getAgencyStats);
router.get('/activity', superAdminOnly, getPlatformActivity);
router.get('/:id', superAdminOnly, getAgencyDetail);
router.patch('/:id/status', superAdminOnly, updateAgencyStatus);
router.post('/:id/support-session', superAdminOnly, postSupportSession);

export default router;
