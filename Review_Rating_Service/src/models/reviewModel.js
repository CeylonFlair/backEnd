import mongoose from 'mongoose';  

const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
    }, { timestamps: true });

export default mongoose.model("Review", reviewSchema); 
