import Joi from 'joi';

export const createOrderSchema = Joi.object({
  listingId: Joi.string().required(),
  bookingDate: Joi.date().required(),
  notes: Joi.string().max(1000).optional()
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled').required()
});