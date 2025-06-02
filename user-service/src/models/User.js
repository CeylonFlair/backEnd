import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    contactNumber: { type: String },
    profilePicture: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordOtp: { type: String }, // 6-digit OTP for password reset
    resetPasswordOtpExpires: { type: Date }, // OTP expiration
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    roles: { type: [String], default: ["user"] },
    country: { type: String, default: "Sri Lanka" },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
