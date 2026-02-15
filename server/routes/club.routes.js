import express from "express";
import {
  addClubMember,
  addMovieToClubWatchlist,
  createClub,
  getClubById,
  getMyClubs,
  removeClubMember,
  removeMovieFromClubWatchlist,
  selectNextMovieNight,
  toggleClubMovieVote,
} from "../controllers/club.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createClub);
router.get("/", getMyClubs);
router.get("/:id", getClubById);

router.post("/:id/members", addClubMember);
router.delete("/:id/members/:userId", removeClubMember);

router.post("/:id/watchlist", addMovieToClubWatchlist);
router.delete("/:id/watchlist/:movieId", removeMovieFromClubWatchlist);
router.post("/:id/watchlist/:movieId/vote", toggleClubMovieVote);

router.post("/:id/next-movie-night/select", selectNextMovieNight);

export default router;
