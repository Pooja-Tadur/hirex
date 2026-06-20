import express from 'express';
import {
  register, login, logout, getMe, updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { forgotPassword, resetPassword } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
export default router;