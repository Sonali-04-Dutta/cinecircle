import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import AvailabilityAlert from "../models/AvailabilityAlert.js";
import { sendAvailabilityEmail, sendReminderEmail } from "./sendEmail.js";
import { checkProviderAvailability } from "./providerAvailability.js";

const startReminderJob = () => {
  // Reminder emails
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

  // OTT availability alerts
  cron.schedule("*/30 * * * *", async () => {
    const pendingAlerts = await AvailabilityAlert.find({ notified: false })
      .populate("user", "email")
      .limit(50);

    for (const alert of pendingAlerts) {
      try {
        if (!alert.user?.email) continue;

        const { isAvailable, link } = await checkProviderAvailability({
          movieId: alert.tmdbMovieId || alert.movieId,
          region: alert.region || "IN",
          providerName: alert.providerName,
          providerId: alert.providerId,
        });

        alert.lastCheckedAt = new Date();
        alert.available = isAvailable;

        if (isAvailable) {
          await sendAvailabilityEmail(
            alert.user.email,
            alert.movieTitle,
            alert.providerName,
            link
          );
          alert.notified = true;
        }

        await alert.save();
      } catch (error) {
        console.error("Availability alert check failed:", error.message);
      }
    }
  });

  console.log("Reminder and availability scheduler started");
};

export default startReminderJob;
