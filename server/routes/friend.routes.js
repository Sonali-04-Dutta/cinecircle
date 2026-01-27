import express from "express";
import { addFriend, getFriends, removeFriend } from "../controllers/friend.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id", protect, addFriend);
router.get("/", protect, getFriends);
router.delete("/:id", protect, removeFriend);

export default router;