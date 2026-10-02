import express from 'express';
import { deleteTask, getTasks, postTask, postTaskComment, updateTask } from '../controllers/taskController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const staff = [protect, allow('admin', 'member')];

router.get('/', staff, getTasks);
router.post('/', staff, postTask);
router.patch('/:id', staff, updateTask);
router.delete('/:id', staff, deleteTask);
router.post('/:id/comments', staff, postTaskComment);

export default router;
