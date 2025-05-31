import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validations/reviewValidation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validateBody(createReviewSchema),
  reviewController.createReview
);
router.put(
  "/:id",
  protect,
  validateBody(updateReviewSchema),
  reviewController.updateReview
);
router.delete("/:id", protect, reviewController.deleteReview);

router.get("/listing/:listingId", reviewController.getReviewsForListing);
router.get("/provider/:providerId", reviewController.getReviewsForProvider);
router.get("/order/:orderId", reviewController.getReviewForOrder);

export default router;
