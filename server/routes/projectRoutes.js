import express from 'express';
import {
  deleteProject,
  getProject,
  getProjects,
  postApproveProject,
  postProject,
  updateProject,
} from '../controllers/projectController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];
const staff = [protect, allow('admin', 'member')];
const clientOnly = [protect, allow('client')];

router.get('/', anyUser, getProjects);
router.post('/', staff, postProject);
router.get('/:id', anyUser, getProject);
router.patch('/:id', staff, updateProject);
router.delete('/:id', staff, deleteProject);
router.post('/:id/approve', clientOnly, postApproveProject);

export default router;
