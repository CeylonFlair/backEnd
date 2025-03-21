const Review = require('../models/reviewModel');

// Get all reviews--> route GET /api/reviews
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new review--> route POST /api/reviews
const createReview = async (req, res) => {
    const { productId, user, rating, comment } = req.body;

    try {
        const review = new Review({ productId, user, rating, comment });
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get reviews by Product ID --> route GET /api/reviews/:productId
const getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReviews, createReview, getReviewsByProduct };
