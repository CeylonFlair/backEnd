const express = require('express');
const router = express.Router();
const { getReviews, createReview, getReviewsByProduct } = require('../controllers/reviewController');

router.get('/', getReviews);  // similar to "/api/reviews"
router.post('/', createReview);  
router.get('/:productId', getReviewsByProduct);  // similar to "/api/reviews/:productId"

module.exports = router;
