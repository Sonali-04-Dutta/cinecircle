import axios from "axios";


import Watchlist from "../models/Watchlist.js";
import Review from "../models/Review.js";

const fetchTrendingFallback = async (apiKey) => {
  try {
    const randomPage = Math.floor(Math.random() * 10) + 1; // Random page 1-10
    const response = await axios.get(`https://www.omdbapi.com/?s=2024&page=${randomPage}&type=movie&apikey=${apiKey}`);
    return response.data.Response === "True" ? response.data.Search.slice(0, 10) : [];
  } catch (error) {
    return [];
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const OMDB_API_KEY = process.env.TMDB_API_KEY?.trim();
    
    if (!OMDB_API_KEY) {
      console.error("CRITICAL: OMDb API Key is missing in server .env");
      return res.json([]);
    }

    const userId = req.user._id;
    // Get the last 10 movies from the watchlist to analyze taste
    const watched = await Watchlist.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
    
    // Filter to ensure we only use valid IMDb IDs (starting with 'tt')
    const movieIds = watched
      .map((m) => m.movieId)
      .filter(id => typeof id === 'string' && id.startsWith('tt'));

    if (movieIds.length === 0) return res.json(await fetchTrendingFallback(OMDB_API_KEY));

    // 1. Fetch details for the last few movies in parallel to aggregate genres
    // We limit to 5 to avoid hitting OMDb rate limits too quickly
    const sampleIds = movieIds.slice(0, 5);
    const detailsResponses = await Promise.all(
      sampleIds.map(id => 
        axios.get(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB_API_KEY}`).catch(() => null)
      )
    );

    const genreCounts = {};
    detailsResponses.forEach(res => {
      if (res?.data?.Response === "True" && res.data.Genre && res.data.Genre !== "N/A") {
        const genres = res.data.Genre.split(",").map(g => g.trim());
        genres.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    // 2. Sort genres by frequency and pick one of the top 3
    const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
    
    if (sortedGenres.length === 0) return res.json(await fetchTrendingFallback(OMDB_API_KEY));

    const topGenres = sortedGenres.slice(0, 3);
    const selectedGenre = topGenres[Math.floor(Math.random() * topGenres.length)];

    const randomPage = Math.floor(Math.random() * 5) + 1; // Random page 1-5
    const recommendations = await axios.get(`https://www.omdbapi.com/?s=${selectedGenre}&page=${randomPage}&apikey=${OMDB_API_KEY}`);

    if (recommendations.data.Response === "True") {
      // Return results in OMDb format (Title, Year, imdbID, Poster)
      res.json(recommendations.data.Search.slice(0, 10));
    } else {
      res.json(await fetchTrendingFallback(OMDB_API_KEY));
    }
  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.json([]); // Return empty array instead of 500 to keep UI stable
  }
};

// 🔍 Search Movies
export const searchMovies = async (req, res) => {
  try {
    const OMDB_API_KEY = process.env.TMDB_API_KEY?.trim();
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const response = await axios.get(`https://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
    
    if (response.data.Response === "True") {
      res.json(response.data.Search);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 🎬 Get Movie Details
export const getMovieDetails = async (req, res) => {
  try {
    const OMDB_API_KEY = process.env.TMDB_API_KEY?.trim();
    const movieId = req.params.id;

    const response = await axios.get(`https://www.omdbapi.com/?i=${movieId}&plot=full&apikey=${OMDB_API_KEY}`);
    
    res.json(response.data);
  } catch (error) {
    console.error("Movie Details Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
