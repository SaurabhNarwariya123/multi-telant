import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const staff = [protect, allow('admin', 'member')];

router.get('/', staff, getDashboard);

export default router;
