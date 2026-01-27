import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import User from "../models/User.js";
import { sendReminderEmail } from "./sendEmail.js";

const startReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const reminders = await Reminder.find({
      remindAt: { $lte: now },
      notified: false,
    }).populate("user");

    for (const reminder of reminders) {
      await sendReminderEmail(reminder.user.email, reminder.movieTitle);
      reminder.notified = true;
      await reminder.save();
    }
  });

  console.log("⏰ Reminder scheduler started");
};

export default startReminderJob;
