import express from "express";
import * as listingController from "../controllers/listingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  createListingSchema,
  updateListingSchema,
} from "../validations/listingValidation.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/", listingController.getAllListings);
router.post(
  "/",
  protect,
  upload.array("images", 5), // Limit to 5 images
  validateBody(createListingSchema),
  listingController.createListing
);
router.get("/:id", protect, listingController.getListingById);
router.get("/:providerId/with-provider", protect, listingController.getListingWithProvider);
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  validateBody(updateListingSchema),
  listingController.updateListing
);
router.delete("/:id", protect, listingController.deleteListing);

export default router;
