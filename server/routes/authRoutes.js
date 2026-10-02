import express from 'express';
import { getMe, postLogin, postRegisterAgency } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-agency', postRegisterAgency);
router.post('/login', postLogin);
router.get('/me', protect, getMe);

export default router;
