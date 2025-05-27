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
