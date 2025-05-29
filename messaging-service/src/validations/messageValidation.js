// create a message validation schema using Joi
import Joi from 'joi';      

export const messageValidationSchema = Joi.object({
  threadId: Joi.string().required().messages({
    'string.empty': 'Thread ID is required',
    'any.required': 'Thread ID is required',
  }),
  content: Joi.string().when('type', {
    is: 'text',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'string.empty': 'Content cannot be empty for text messages',
  }),
  type: Joi.string().valid('text', 'image', 'file').required().messages({
    'any.only': 'Type must be one of text, image, or file',
    'any.required': 'Type is required',
  }),
});