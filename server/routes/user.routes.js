import express from "express";
import { getUserProfile, updateUserProfile, getUserById } from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/:id", protect, getUserById);

export default router;
