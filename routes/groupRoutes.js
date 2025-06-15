import { Router } from "express";
import {
  addMembers,
  createGroup,
  getGroupDetails,
  removeMember,
  updateGroupDetails,
} from "../controllers/groupController.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

const router = Router();

// Protect all group routes
router.use(authenticateUser);

router.post("/create-group", createGroup);
router.get("/:groupId", getGroupDetails);
router.patch("/:groupId", updateGroupDetails);
router.post("/:groupId/members", addMembers);
router.delete("/", removeMember);

export default router;
