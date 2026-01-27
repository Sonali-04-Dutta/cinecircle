import express from "express";
import { getMessages } from "../controllers/chat.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getMessages);

export default router;
