import express from "express";
import {
  setReminder,
  getMyReminders,
} from "../controllers/reminder.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, setReminder);
router.get("/", protect, getMyReminders);

export default router;
