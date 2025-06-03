import mongoose from "mongoose";

const allowedCategories = [
  "Handicraft Artwork",
  "Textile Creation",
  "Home Decor",
  "Jewelry & Accessories",
  "Wellness & Beauty",
  "Ceremonial Arts",
  "Educational Services",
];

const listingSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: allowedCategories },
    images: [{ type: String }],
    coverImage: { type: String }, // New field for cover image
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    deliveryTime: { type: Number, required: true }, // days
    numberOfRevisions: { type: Number, required: true }, // -1 for unlimited
    features: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
