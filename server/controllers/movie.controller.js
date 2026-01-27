import axios from "axios";


import Watchlist from "../models/Watchlist.js";
import Review from "../models/Review.js";

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const watched = await Watchlist.find({ user: userId });
    const movieIds = watched.map((m) => m.movieId);

    if (movieIds.length === 0) return res.json([]);

    const randomMovie = movieIds[Math.floor(Math.random() * movieIds.length)];

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${randomMovie}/recommendations`,
      { params: { api_key: TMDB_API_KEY } }
    );

    res.json(response.data.results.slice(0, 10));
  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Search Movies
export const searchMovies = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query,
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 🎬 Get Movie Details
export const getMovieDetails = async (req, res) => {
  try {
    const movieId = req.params.id;

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: "credits,videos",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Movie Details Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
