import express from "express";
import {
  deleteReviewAdmin,
  deleteUserAdmin,
  getAdminStats,
  getReviewsAdmin,
  getUsersAdmin,
  updateUserRoleAdmin,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getUsersAdmin);
router.put("/users/:id/role", updateUserRoleAdmin);
router.delete("/users/:id", deleteUserAdmin);

router.get("/reviews", getReviewsAdmin);
router.delete("/reviews/:id", deleteReviewAdmin);

export default router;
