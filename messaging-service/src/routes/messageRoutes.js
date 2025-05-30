import express from 'express';
import multer from 'multer';
import * as messageController from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import { messageValidationSchema } from '../validations/messageValidation.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("file"),
  validateBody(messageValidationSchema),
  messageController.sendMessage
);

export default router;