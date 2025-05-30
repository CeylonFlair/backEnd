import User from "../models/User.js";
import { hashPassword  , comparePassword} from "../utils/hashPassword.js";
import cloudinary from "../config/cloudinary.js";

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

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -isLocked -failedLoginAttempts -twoFactorEnabled -twoFactorSecret"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, contactNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.contactNumber = contactNumber || user.contactNumber;

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture from Cloudinary if exists
      if (user.profilePicture) {
        const matches = user.profilePicture.match(
          /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/
        );
        const public_id = matches ? matches[1] : null;
        if (public_id) {
          try {
            await cloudinary.uploader.destroy(public_id);
          } catch (e) {
            console.error("Failed to delete old profile picture:", e.message);
          }
        }
      }

      // Upload new profile picture to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_pictures" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      user.profilePicture = result.secure_url;
    }

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
