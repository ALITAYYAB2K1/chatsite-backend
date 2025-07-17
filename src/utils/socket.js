import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Import routes with correct paths
import userRoutes from "../routes/user.routes.js";
import messageRoutes from "../routes/message.routes.js";

// Use routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/message", messageRoutes);

const userSocketMap = {};

export function getRecieverSocketId(userId) {
  return userSocketMap[userId] || null;
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
