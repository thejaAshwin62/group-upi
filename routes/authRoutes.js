import { Router } from "express";
const router = Router();
import {
  register,
  login,
  getCurrentUser,
  updateUser,
  logout,
  validateUsername,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", authenticateUser, getCurrentUser);
router.patch("/update-user", authenticateUser, updateUser);
router.get("/logout", authenticateUser, logout);
router.post("/validate-username", validateUsername);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/update-password", authenticateUser, updatePassword);

export default router;
