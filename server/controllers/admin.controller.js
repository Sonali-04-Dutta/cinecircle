import User from "../models/User.js";
import Review from "../models/Review.js";
import Message from "../models/Message.js";
import Reminder from "../models/Reminder.js";
import Watchlist from "../models/Watchlist.js";
import Notification from "../models/Notification.js";
import Club from "../models/Club.js";
import AvailabilityAlert from "../models/AvailabilityAlert.js";

const buildDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const getAdminStats = async (req, res) => {
  try {
    const since = buildDateDaysAgo(7);

    const [
      users,
      reviews,
      messages,
      reminders,
      watchlistItems,
      clubs,
      availabilityAlerts,
      newUsersLast7Days,
      newReviewsLast7Days,
    ] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      Message.countDocuments(),
      Reminder.countDocuments(),
      Watchlist.countDocuments(),
      Club.countDocuments(),
      AvailabilityAlert.countDocuments(),
      User.countDocuments({ createdAt: { $gte: since } }),
      Review.countDocuments({ createdAt: { $gte: since } }),
    ]);

    return res.json({
      users,
      reviews,
      messages,
      reminders,
      watchlistItems,
      clubs,
      availabilityAlerts,
      newUsersLast7Days,
      newReviewsLast7Days,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUsersAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email avatar role isVerified createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["user", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      Review.deleteMany({ user: userId }),
      Watchlist.deleteMany({ user: userId }),
      Reminder.deleteMany({ user: userId }),
      AvailabilityAlert.deleteMany({ user: userId }),
      Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] }),
      Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
      Club.updateMany(
        {},
        {
          $pull: {
            members: userId,
            "watchlist.$[].votes": userId,
          },
        }
      ),
      Club.deleteMany({ owner: userId }),
      User.updateMany(
        {},
        {
          $pull: {
            friends: userId,
            friendRequests: userId,
          },
        }
      ),
      User.findByIdAndDelete(userId),
    ]);

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReviewsAdmin = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
    const skip = (page - 1) * limit;
    const q = (req.query.q || "").trim();

    const filter = q
      ? {
          $or: [
            { movieTitle: { $regex: q, $options: "i" } },
            { comment: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    return res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
