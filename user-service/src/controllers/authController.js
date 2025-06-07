import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../services/emailService.js";
import crypto from "crypto";

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      roles,
      country,
      description,
      contactNumber,
    } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashed = await hashPassword(password);

    // Creating a 6-digit OTP for email verification
    // This OTP will be sent to the user's email for verification
    // It will expire in 05 minutes
    // const authVerificationCode = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    const authVerificationCode = '111111';

    // 5 minutes expiration
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    user = await User.create({
      name,
      email,
      password: hashed,
      verificationToken: authVerificationCode,
      verificationTokenExpires: expires,
      country,
      description,
      contactNumber,
      roles,
    });

    await sendVerificationEmail(user, authVerificationCode);
    res.status(201).json({ message: "Registered. Verification email sent." });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    // Find user by email AND OTP
    const user = await User.findOne({ email, verificationToken: otp });

    if (!user)
      return res.status(400).json({ message: "Invalid OTP or email!" });

    //Check whether OTP has expired
    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      return res.status(400).json({ message: "OTP expired!" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    // Generate new OTP and expiration
    // const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtp = '111111'; // For testing purposes, using a fixed OTP
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    user.verificationToken = newOtp;
    user.verificationTokenExpires = expires;
    await user.save();

    await sendVerificationEmail(user, newOtp);

    res.json({ message: "OTP resent successfully." });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.isLocked)
      return res
        .status(403)
        .json({ message: "Account locked. Too many failed attempts." });
    if (!user.isVerified)
      return res.status(401).json({ message: "Email not verified." });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 3) user.isLocked = true;
      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.failedLoginAttempts = 0;
    await user.save();

    const token = generateToken(user);
    res.json({ message: "Login Successful !", token });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    // Generate 6-digit OTP and expiration (5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = expires;
    await user.save();
    await sendResetPasswordEmail(user, otp); // Pass OTP instead of token

    res.json({ message: "Password reset OTP sent." });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email, resetPasswordOtp: otp });
    if (!user) return res.status(400).json({ message: "Invalid OTP or email" });

    // Check OTP expiration
    if (
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < new Date()
    ) {
      return res.status(400).json({ message: "OTP expired!" });
    }

    user.password = await hashPassword(password);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    res.json({ message: "Password updated." });
  } catch (err) {
    next(err);
  }
};
