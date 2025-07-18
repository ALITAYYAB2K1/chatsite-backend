import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  // Check multiple sources for the token
  let token = req.cookies.token;

  if (!token) {
    // Check Authorization header
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

  if (!token) {
    // Check custom x-token header
    token = req.headers["x-token"];
  }

  console.log("Token sources checked:");
  console.log("- Cookie token:", req.cookies.token ? "Found" : "Not found");
  console.log(
    "- Authorization header:",
    req.headers["authorization"] ? "Found" : "Not found"
  );
  console.log(
    "- x-token header:",
    req.headers["x-token"] ? "Found" : "Not found"
  );
  console.log("- Final token:", token ? "Found" : "Not found");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
};
