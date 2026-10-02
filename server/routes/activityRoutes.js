import express from 'express';
import { getActivity } from '../controllers/activityController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];

router.get('/', anyUser, getActivity);

export default router;
