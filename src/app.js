import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1", userRoutes);
export default app;
