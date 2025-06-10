import express from "express";
import * as orderController from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  createOrderSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
} from "../validations/orderValidation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validateBody(createOrderSchema),
  orderController.createOrder
);
router.get("/my", protect, orderController.getMyOrders);
router.get("/provider", protect, orderController.getProviderOrders);
router.get("/associated-users", protect, orderController.getAssociatedUsers);
router.get("/:id", protect, orderController.getOrderById);
router.patch(
  "/:id/status",
  protect,
  validateBody(updateStatusSchema),
  orderController.updateOrderStatus
);
router.patch(
  "/:id/payment-status",
  protect,
  validateBody(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

export default router;
