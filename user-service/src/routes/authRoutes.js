import express from "express";
import * as authController from "../controllers/authController.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerSchema,
  loginSchema,
  emailVerificationSchema,
  resendOtpSchema,
} from "../validations/userValidation.js";

const router = express.Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post(
  "/verify-email",
  validateBody(emailVerificationSchema),
  authController.verifyEmail
);
router.post(
  "/resend-otp",
  validateBody(resendOtpSchema),
  authController.resendOtp
);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/reset-password-request", authController.resetPasswordRequest);
router.post("/reset-password", authController.resetPassword);

export default router;
