import Reminder from "../models/Reminder.js";

// ➕ Set Reminder
export const setReminder = async (req, res) => {
  try {
    const { movieTitle, movieId, remindAt } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      movieTitle,
      movieId,
      remindAt,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get My Reminders
export const getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({
      remindAt: 1,
    });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
