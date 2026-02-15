import mongoose from "mongoose";

const availabilityAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    tmdbMovieId: {
      type: String,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    providerId: {
      type: Number,
    },
    region: {
      type: String,
      default: "IN",
    },
    notified: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: false,
    },
    lastCheckedAt: Date,
  },
  { timestamps: true }
);

availabilityAlertSchema.index(
  { user: 1, movieId: 1, providerName: 1, region: 1 },
  { unique: true }
);

export default mongoose.model("AvailabilityAlert", availabilityAlertSchema);
