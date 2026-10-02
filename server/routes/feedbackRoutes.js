import express from 'express';
import {
  deleteFeedback,
  getFeedback,
  getFeedbacks,
  postFeedback,
  postFeedbackComment,
  updateFeedback,
} from '../controllers/feedbackController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];
const staff = [protect, allow('admin', 'member')];

router.get('/', anyUser, getFeedbacks);
router.post('/', anyUser, postFeedback);
router.get('/:id', anyUser, getFeedback);
router.patch('/:id', staff, updateFeedback);
router.delete('/:id', staff, deleteFeedback);
router.post('/:id/comments', anyUser, postFeedbackComment);

export default router;
