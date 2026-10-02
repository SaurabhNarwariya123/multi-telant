import express from 'express';
import { deleteMilestone, getMilestones, postMilestone, updateMilestone } from '../controllers/milestoneController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];
const staff = [protect, allow('admin', 'member')];

router.get('/', anyUser, getMilestones);
router.post('/', staff, postMilestone);
router.patch('/:id', staff, updateMilestone);
router.delete('/:id', staff, deleteMilestone);

export default router;
