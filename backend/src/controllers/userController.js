import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { updateProfileSchema, changePasswordSchema } from "../validators/userValidator.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Get me error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email } = parsed.data;

    const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });

    if (existingUser) {
      return res.status(409).json({
        message: "That email is already in use by another account",
      });
    }

    const user = await User.findById(req.userId);
    user.name = name;
    user.email = email;
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await User.findById(req.userId).select("+password +refreshToken");

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.refreshToken = null;

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};