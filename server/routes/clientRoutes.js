import express from 'express';
import { deleteClient, getClient, getClients, postClient, updateClient } from '../controllers/clientController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const staff = [protect, allow('admin', 'member')];

router.get('/', staff, getClients);
router.post('/', staff, postClient);
router.get('/:id', staff, getClient);
router.patch('/:id', staff, updateClient);
router.delete('/:id', staff, deleteClient);

export default router;
