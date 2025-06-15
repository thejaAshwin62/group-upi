import { Router } from "express";
const router = Router();
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", authenticateUser,getCurrentUser);

export default router;
