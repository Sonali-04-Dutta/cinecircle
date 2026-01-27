import express from "express";
import { searchMovies, getMovieDetails, getRecommendations } from "../controllers/movie.controller.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ IMPORT ADDED

const router = express.Router();

router.get("/search", searchMovies);
router.get("/recommendations/me", protect, getRecommendations); // 🔒 Protected
router.get("/:id", getMovieDetails);

export default router;
