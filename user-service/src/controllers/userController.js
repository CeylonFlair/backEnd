import User from "../models/User.js";
import { hashPassword  , comparePassword} from "../utils/hashPassword.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -isLocked -failedLoginAttempts -twoFactorEnabled -twoFactorSecret"
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, contactNumber } = req.body;
    const user = await User.findById(req.user.id).select(
      "-password -isLocked -failedLoginAttempts -twoFactorEnabled -twoFactorSecret -isVerified -verificationToken -verificationTokenExpires -resetPasswordOtp -resetPasswordOtpExpires"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;
    if (req.file) user.profilePicture = req.file.path;
    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!(await comparePassword(oldPassword, user.password)))
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await hashPassword(newPassword);
    await user.save();
    res.json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
};
