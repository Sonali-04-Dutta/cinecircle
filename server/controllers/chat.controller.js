import Message from "../models/Message.js";

// 📥 Get chat history between two users
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 }).populate("replyTo");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❤️ Toggle Reaction
export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    await message.populate("replyTo"); // Populate to ensure frontend reply UI doesn't break

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Delete chat history
export const deleteChat = async (req, res) => {
  try {
    const { id: friendId } = req.params;
    const userId = req.user._id;

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Toggle Pin
export const togglePin = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== userId.toString() && message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.pinned = !message.pinned;
    await message.save();
    await message.populate("replyTo");

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
