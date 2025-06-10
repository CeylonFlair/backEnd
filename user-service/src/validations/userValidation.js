import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  repeat_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .label("Repeat password")
    .messages({ "any.only": "Passwords do not match" }),
  roles: Joi.array()
    .items(Joi.string().valid("user", "artisan"))
    .default(["user"]),
  country: Joi.string().default("Sri Lanka"),
  description: Joi.string().max(200),
  contactNumber: Joi.string()
    .pattern(/^\(\d+\)\s\d+$/)
    .message("Contact number must be in the format (country code) <number>")
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const emailVerificationSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  otp: Joi.string().required().label("OTP"),
});

export const resendOtpSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
});
