import express from 'express';
import { deleteUser, getTeamMembers, getUsers, postUser, updateUser } from '../controllers/userController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [protect, allow('admin')];
const staff = [protect, allow('admin', 'member')];

router.get('/', adminOnly, getUsers);
router.get('/team', staff, getTeamMembers);
router.post('/', adminOnly, postUser);
router.patch('/:id', adminOnly, updateUser);
router.delete('/:id', adminOnly, deleteUser);

export default router;
