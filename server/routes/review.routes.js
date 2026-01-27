import express from "express";
import {
  addReview,
  getMovieReviews,
  deleteReview,
  getFriendsReviews
} from "../controllers/review.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addReview);
router.get("/:movieId", getMovieReviews);
router.delete("/:id", protect, deleteReview);
router.get("/feed/friends", protect, getFriendsReviews);

export default router;
