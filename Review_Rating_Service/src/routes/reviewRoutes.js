import express from 'express';  
import  { getReviews, createReview, getReviewsByProduct } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);  // similar to "/api/reviews"
router.post('/', createReview);  
router.get('/:productId', getReviewsByProduct);  // similar to "/api/reviews/:productId"

export default router;  
