import User from "../models/User.js";
import Message from "../models/Message.js";

export const addFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    if (user.friends.includes(id)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    user.friends.push(id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "name email avatar");
    
    const friendsWithUnread = await Promise.all(
      user.friends.map(async (friend) => {
        if (!friend) return null;
        const unreadCount = await Message.countDocuments({
          sender: friend._id,
          receiver: req.user._id,
          seen: false,
        });
        return { ...friend.toObject(), unreadCount };
      })
    );

    res.status(200).json(friendsWithUnread.filter((f) => f !== null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friends = user.friends.filter((friendId) => friendId.toString() !== id);
    friend.friends = friend.friends.filter((friendId) => friendId.toString() !== user._id.toString());

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};