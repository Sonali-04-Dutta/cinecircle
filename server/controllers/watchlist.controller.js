import Watchlist from "../models/Watchlist.js";

// ➕ Add Movie to Watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate } = req.body;

    const alreadyExists = await Watchlist.findOne({
      user: req.user._id,
      movieId,
    });

    if (alreadyExists) {
      return res.status(400).json({ message: "Movie already in watchlist" });
    }

    const movie = await Watchlist.create({
      user: req.user._id,
      movieId,
      title,
      posterPath,
      releaseDate,
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get User Watchlist
export const getWatchlist = async (req, res) => {
  try {
    const movies = await Watchlist.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Remove from Watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const movie = await Watchlist.findOneAndDelete({
      user: req.user._id,
      movieId: req.params.movieId,
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
