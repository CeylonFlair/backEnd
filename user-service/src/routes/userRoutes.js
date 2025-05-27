import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, userController.getProfile);
router.put('/me', protect, userController.updateProfile);
router.post('/change-password', protect, userController.changePassword);

export default router;