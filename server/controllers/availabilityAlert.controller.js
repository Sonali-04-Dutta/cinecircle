import AvailabilityAlert from "../models/AvailabilityAlert.js";
import { checkProviderAvailability } from "../utils/providerAvailability.js";
import { sendAvailabilityEmail } from "../utils/sendEmail.js";

const defaultRegion = process.env.DEFAULT_REGION || "IN";

export const createAvailabilityAlert = async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      providerName,
      providerId = null,
      region = defaultRegion,
    } = req.body;

    if (!movieId || !movieTitle || !providerName) {
      return res
        .status(400)
        .json({ message: "movieId, movieTitle and providerName are required" });
    }

    const availability = await checkProviderAvailability({
      movieId,
      region,
      providerName,
      providerId,
    });
    const normalizedMovieId = availability.resolvedMovieId || movieId;

    const existing = await AvailabilityAlert.findOne({
      user: req.user._id,
      $or: [{ movieId: { $in: [movieId, normalizedMovieId] } }, { tmdbMovieId: normalizedMovieId }],
      providerName,
      region,
    });
    if (existing) {
      return res.status(200).json(existing);
    }

    const alert = await AvailabilityAlert.create({
      user: req.user._id,
      movieId,
      tmdbMovieId: normalizedMovieId !== movieId ? normalizedMovieId : undefined,
      movieTitle,
      providerName,
      providerId,
      region,
    });

    alert.lastCheckedAt = new Date();
    if (availability.isAvailable) {
      alert.available = true;
      alert.notified = true;
      await sendAvailabilityEmail(req.user.email, movieTitle, providerName, availability.link);
    }
    await alert.save();

    return res.status(201).json(alert);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailabilityAlerts = async (req, res) => {
  try {
    const alerts = await AvailabilityAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(alerts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAvailabilityAlert = async (req, res) => {
  try {
    const alert = await AvailabilityAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    return res.json({ message: "Alert deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
