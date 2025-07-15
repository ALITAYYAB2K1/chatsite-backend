import { Router } from "express";
import { Signup } from "../controllers/user.controller.js";
const router = Router();
router.route("/signup").post(Signup);
// router.route("/login").post();
// router.route("/logout").post();
export default router;
