import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import multer from "multer";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/me', protect, userController.getProfile);
router.put('/me', protect, upload.single("profilePicture"), userController.updateProfile);
router.post('/change-password', protect, userController.changePassword);

export default router;