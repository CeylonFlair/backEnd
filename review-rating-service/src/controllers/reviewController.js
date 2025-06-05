import Review from "../models/Review.js";
import { getOrderDetails } from "../services/orderService.js";
import { updateListingAverageRating } from "../services/listingService.js";
import { getUserById } from "../services/userService.js";
import mongoose from "mongoose";

// Create review
export const createReview = async (req, res, next) => {
  try {
    const { order: orderId, rating, comment } = req.body;
    // Ensure reviewer has not already reviewed this order
    if (await Review.exists({ order: orderId, reviewer: req.user.id })) {
      return res.status(400).json({ message: "Already reviewed" });
    }
    // Verify order details
    const order = await getOrderDetails(
      orderId,
      req.headers.authorization?.split(" ")[1]
    );

    const disallowedStatuses = ["completed", "cancelled"];

    if (
      !order ||
      order.customerId !== req.user.id ||
      disallowedStatuses.includes(order.status)
    ) {
      console.log(`${order._id}`);
      console.log(`${order.customerId}`);
      console.log(`${req.user.id}`);
      console.log(`${order.status}`);

      return res.status(400).json({ message: "Invalid order for review" });
    }
    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      provider: order.providerId,
      listing: order.listingId,
      order: orderId,
      rating,
      comment,
    });
    await updateListingAverageRating(
      order.listingId,
      await calcAvgRating(order.listingId),
      req.headers.authorization?.split(" ")[1],
      "create"
    );
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// Edit review
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    review.rating = rating;
    review.comment = comment;
    await review.save();
    await updateListingAverageRating(
      review.listing,
      await calcAvgRating(review.listing),
      req.headers.authorization?.split(" ")[1],
      "update"
    );
    res.json(review);
  } catch (err) {
    next(err);
  }
};

// Delete review
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await Review.deleteOne({ _id: id });
    await updateListingAverageRating(
      review.listing,
      await calcAvgRating(review.listing),
      req.headers.authorization?.split(" ")[1],
      "delete"
    );
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

// List reviews for a listing
export const getReviewsForListing = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId }).sort(
      "-createdAt"
    );
    // Fetch reviewer details for each review
    const token = req.headers.authorization?.split(" ")[1];
    const reviewsWithReviewer = await Promise.all(
      reviews.map(async (review) => {
        let reviewerDetails = null;
        try {
          const user = await getUserById(review.reviewer, token);
          reviewerDetails = {
            profilePicture: user.profilePicture,
            name: user.name,
            country: user.country,
          };
        } catch (e) {
          reviewerDetails = null;
        }
        return {
          ...review.toObject(),
          reviewerDetails,
        };
      })
    );
    res.json(reviewsWithReviewer);
  } catch (err) {
    next(err);
  }
};

// List reviews for a provider
export const getReviewsForProvider = async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId }).sort(
      "-createdAt"
    );
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// List review for an order
export const getReviewForOrder = async (req, res, next) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    next(err);
  }
};

// Helper: calculate average rating for a listing
async function calcAvgRating(listingId) {
  const stats = await Review.aggregate([
    {
      $match: {
        listing:
          typeof listingId === "string"
            ? new mongoose.Types.ObjectId(listingId)
            : listingId,
      },
    },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  return stats[0]?.avg || 0;
}
