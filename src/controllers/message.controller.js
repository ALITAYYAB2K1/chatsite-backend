import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import cloudinary from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";
import { getRecieverSocketId, io } from "../utils/socket.js";

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
        { senderId: myId, recieverId: UserToChatId },
        { senderId: UserToChatId, recieverId: myId },
      ],
    })
      .populate("senderId", "-password -__v")
      .populate("recieverId", "-password -__v")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // recipient id
    const { text } = req.body;
    const senderId = req.user._id;

    let imageUrl = null;

    // Handle image upload if file is present
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const base64Image = fileBuffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      // Upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI);
      imageUrl = uploadResponse.secure_url;
    }

    // Save message to database with correct field names
    const newMessage = new Message({
      senderId: senderId,
      recieverId: id,
      text: text || "",
      image: imageUrl,
    });

    await newMessage.save();

    // Populate the sender and receiver info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "-password -__v")
      .populate("recieverId", "-password -__v");

    // Fixed: Use 'id' instead of 'recieverId' for socket emission
    const receiverSocketId = getRecieverSocketId(id);
    if (receiverSocketId) {
      // Emit the new message to the receiver
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message and check if user is authorized to delete it
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    // If message has an image, delete it from Cloudinary
    if (message.image && message.image.trim() !== "") {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = message.image.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        // Continue with message deletion even if Cloudinary deletion fails
      }
    }

    // Delete the message from database
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    });
  }
};

export { getUsers, getMessages, sendMessage, deleteMessage };
