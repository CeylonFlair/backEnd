import express from 'express';
import * as threadController from '../controllers/threadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, threadController.getThreads);
router.get('/:id/messages', protect, threadController.getThreadMessages);
router.post("/create", protect, threadController.createThread);

export default router;