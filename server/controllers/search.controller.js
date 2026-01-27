import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      name: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id }, // Exclude current user
    }).select("name email avatar");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};