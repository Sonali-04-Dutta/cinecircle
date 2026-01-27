import Review from "../models/Review.js";
import User from "../models/User.js";


// ➕ Add or Update Review
export const addReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    let review = await Review.findOne({
      user: req.user._id,
      movieId,
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      if (image) review.image = image;
      await review.save();
      return res.json(review);
    }

    review = await Review.create({
      user: req.user._id,
      movieId,
      rating,
      comment,
      image,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get Reviews for a Movie
export const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get Review from Friends
export const getFriendsReviews = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const reviews = await Review.find({ user: { $in: user.friends } })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ❌ Delete Review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
