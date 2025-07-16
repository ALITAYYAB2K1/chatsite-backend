import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: String,
    image: String,
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
export const Message = mongoose.model("Message", messageSchema);
