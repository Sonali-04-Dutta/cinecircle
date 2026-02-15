import express from "express";
import {
  addFriend,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controllers/friend.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFriends);
router.get("/requests", protect, getFriendRequests);
router.post("/request/:id", protect, sendFriendRequest);
router.put("/request/:id/accept", protect, acceptFriendRequest);
router.delete("/request/:id/reject", protect, rejectFriendRequest);
router.delete("/request/:id/cancel", protect, cancelFriendRequest);
router.post("/:id", protect, addFriend);
router.delete("/:id", protect, removeFriend);

export default router;
