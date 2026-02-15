import User from "../models/User.js";
import Message from "../models/Message.js";

const hasId = (list = [], id) => list.some((item) => item.toString() === id.toString());

const addMutualFriendship = async (user, friend) => {
  if (!hasId(user.friends, friend._id)) user.friends.push(friend._id);
  if (!hasId(friend.friends, user._id)) friend.friends.push(user._id);
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    if (hasId(user.friends, id)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    // If the other user has already sent you a request, auto-accept.
    if (hasId(user.friendRequests, id)) {
      user.friendRequests = user.friendRequests.filter(
        (requesterId) => requesterId.toString() !== id
      );
      await addMutualFriendship(user, friend);
      await user.save();
      await friend.save();
      return res.status(200).json({ message: "Friend request accepted automatically" });
    }

    if (hasId(friend.friendRequests, user._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    friend.friendRequests.push(user._id);
    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const requester = await User.findById(id);

    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!hasId(user.friendRequests, id)) {
      return res.status(400).json({ message: "No pending request from this user" });
    }

    user.friendRequests = user.friendRequests.filter(
      (requesterId) => requesterId.toString() !== id
    );
    await addMutualFriendship(user, requester);

    await user.save();
    await requester.save();

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    user.friendRequests = user.friendRequests.filter(
      (requesterId) => requesterId.toString() !== id
    );
    await user.save();

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    targetUser.friendRequests = targetUser.friendRequests.filter(
      (requesterId) => requesterId.toString() !== req.user._id.toString()
    );
    await targetUser.save();

    return res.status(200).json({ message: "Friend request cancelled" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friendRequests",
      "name email avatar"
    );

    const outgoing = await User.find({ friendRequests: req.user._id }).select(
      "name email avatar"
    );

    return res.status(200).json({
      incoming: user.friendRequests || [],
      outgoing,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Backward compatible alias for older clients
export const addFriend = sendFriendRequest;

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

    return res.status(200).json(friendsWithUnread.filter((f) => f !== null));
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
