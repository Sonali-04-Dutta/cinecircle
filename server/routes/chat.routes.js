import express from "express";
import { getMessages, deleteChat, editMessage, toggleReaction, togglePin, deleteMessage, deleteMessageForMe, searchMessages, clearChatForMe } from "../controllers/chat.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getMessages);
router.get("/search/:userId", protect, searchMessages);
router.delete("/messages/:messageId", protect, deleteMessage);
router.delete("/messages/:messageId/me", protect, deleteMessageForMe);
router.delete("/:id/me", protect, clearChatForMe);
router.delete("/:id", protect, deleteChat);
router.put("/message/:messageId", protect, editMessage);
router.put("/message/:messageId/reaction", protect, toggleReaction);
router.put("/message/:messageId/pin", protect, togglePin);

export default router;
