import Joi from 'joi';

export const createListingSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().min(3).max(50).required(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

export const updateListingSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(2000),
  price: Joi.number().positive(),
  category: Joi.string().min(3).max(50),
  removeImages: Joi.string().optional(), 
  images: Joi.array().items(Joi.string().uri()),
});