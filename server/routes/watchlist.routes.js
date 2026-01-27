import express from "express";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToWatchlist);
router.get("/", protect, getWatchlist);
router.delete("/:movieId", protect, removeFromWatchlist);

export default router;
