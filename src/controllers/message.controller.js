import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import cloudinary from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";

const getUsers = async (req, res) => {
  try {
    const loginedUser = req.user._id;
    const users = await User.find({ _id: { $ne: loginedUser } }).select(
      "-password -__v"
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMessages = async (req, res) => {
  try {
    const { id: UserToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { from: myId, to: UserToChatId },
        { from: UserToChatId, to: myId },
      ],
    })
      .populate("from", "-password -__v")
      .populate("to", "-password -__v")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: UserToChatId } = req.params;
    const myId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const message = new Message({
      senderId: myId,
      recieverId: UserToChatId,
      text,
      image: imageUrl,
    });
    await message.save();
    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
    // socket.io to implemenet real-time messaging
  } catch (error) {}
};
export { getUsers, getMessages };
