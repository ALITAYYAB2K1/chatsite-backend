import { Router } from "express";
import {
  Signup,
  Logout,
  Login,
  UpdateProfile,
  GetProfile,
  checkAuth,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();
router.route("/signup").post(Signup);
router.route("/login").post(Login);
router.route("/logout").post(verifyJWT, Logout);
router
  .route("/profile")
  .get(verifyJWT, GetProfile)
  .put(verifyJWT, upload.single("avatar"), UpdateProfile);
router.route("/check").get(verifyJWT, checkAuth);
router.route("/delete").delete(verifyJWT, deleteUser);

export default router;
