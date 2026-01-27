import express from "express";
import { searchUsers } from "../controllers/search.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", protect, searchUsers);

export default router;