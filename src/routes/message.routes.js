import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getUsers,
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/users").get(verifyJWT, getUsers);
router.route("/:id").get(verifyJWT, getMessages);
router.route("/send/:id").post(verifyJWT, upload.single("image"), sendMessage);
router.route("/delete/:messageId").delete(verifyJWT, deleteMessage);
export default router;
