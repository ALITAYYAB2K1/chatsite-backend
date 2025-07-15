import { Router } from "express";
import { Signup, Logout, Login } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/signup").post(Signup);
router.route("/login").post(Login);
router.route("/logout").post(verifyJWT, Logout);
export default router;
