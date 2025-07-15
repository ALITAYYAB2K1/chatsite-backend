import { Router } from "express";
import {
  Signup,
  Logout,
  Login,
  UpdateProfile,
  checkAuth,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/signup").post(Signup);
router.route("/login").post(Login);
router.route("/logout").post(verifyJWT, Logout);
router.route("update-profile").put(verifyJWT, UpdateProfile);
router.route("/check").get(verifyJWT, checkAuth);
export default router;
