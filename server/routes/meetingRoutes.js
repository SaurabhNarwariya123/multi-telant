import express from 'express';
import { deleteMeeting, getMeetings, postMeeting, updateMeeting } from '../controllers/meetingController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];
const staff = [protect, allow('admin', 'member')];

router.get('/', anyUser, getMeetings);
router.post('/', staff, postMeeting);
router.patch('/:id', staff, updateMeeting);
router.delete('/:id', staff, deleteMeeting);

export default router;
