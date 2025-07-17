import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import cloudinary from "../utils/cloudinary.js";

const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }
  const existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    if (user) {
      const token = generateToken(user._id, res);
      await user.save();
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token: token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id, res);
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token: token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: "chat_avatars", // Optional: organize uploads in folders
      resource_type: "image",
    });

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResponse.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const GetProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

export { Signup, Logout, Login, UpdateProfile, checkAuth, GetProfile };
