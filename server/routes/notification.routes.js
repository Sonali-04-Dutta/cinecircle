import express from "express";
import { getNotifications,getUnreadCount ,markNotificationsAsRead, markSingleNotificationAsRead } from "../controllers/notification.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/mark-read", protect, markNotificationsAsRead);
router.put("/:id/read", protect, markSingleNotificationAsRead);

export default router;