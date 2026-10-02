import express from 'express';
import { getProjectHealth } from '../controllers/aiController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const staff = [protect, allow('admin', 'member')];

router.get('/project-health/:projectId', staff, getProjectHealth);

export default router;
