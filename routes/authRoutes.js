import { Router } from "express";
const router = Router();
import {
  register,
  login,
  getCurrentUser,
  updateUser,
  logout,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", authenticateUser, getCurrentUser);
router.patch("/update-user", authenticateUser, updateUser);
router.get("/logout", authenticateUser, logout);

export default router;
