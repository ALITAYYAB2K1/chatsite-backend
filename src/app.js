import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1", userRoutes);
export default app;
