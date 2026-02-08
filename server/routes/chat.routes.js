import express from "express";
import { getMessages, deleteChat, editMessage } from "../controllers/chat.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getMessages);
router.delete("/:id", protect, deleteChat);
router.put("/message/:messageId", protect, editMessage);

export default router;
