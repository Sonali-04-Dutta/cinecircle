import express from "express";
import {
  createAvailabilityAlert,
  deleteAvailabilityAlert,
  getAvailabilityAlerts,
} from "../controllers/availabilityAlert.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAvailabilityAlert);
router.get("/", protect, getAvailabilityAlerts);
router.delete("/:id", protect, deleteAvailabilityAlert);

export default router;
