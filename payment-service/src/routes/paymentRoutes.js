import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, paymentController.initiatePayment);
router.post('/ipn', express.urlencoded({ extended: false }), paymentController.handlePayhereIPN);
router.get('/status/:orderId', protect, paymentController.getPaymentStatus);

export default router;