import Joi from "joi";

// Allowed categories
const allowedCategories = [
  "Handicraft Artwork",
  "Textile Creation",
  "Home Decor",
  "Jewelry & Accessories",
  "Wellness & Beauty",
  "Ceremonial Arts",
  "Educational Services",
];

export const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string()
    .valid(...allowedCategories)
    .required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  coverImage: Joi.string().uri().optional(), // Accept URL if sent as string (not file)
  deliveryTime: Joi.number().integer().min(1).required(),
  numberOfRevisions: Joi.number().integer().required(),
  features: Joi.array().items(Joi.string()).optional(),
});

export const updateListingSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(2000),
  price: Joi.number().positive(),
  category: Joi.string().valid(...allowedCategories),
  removeImages: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()),
  coverImage: Joi.string().uri().optional(), // Accept URL if sent as string (not file)
  deliveryTime: Joi.number().integer().min(1),
  numberOfRevisions: Joi.number().integer(),
  features: Joi.array().items(Joi.string()),
});
