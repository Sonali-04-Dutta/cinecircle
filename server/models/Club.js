import mongoose from "mongoose";

const clubMovieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    posterPath: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: String,
      default: "",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const nextMovieNightSchema = new mongoose.Schema(
  {
    movieId: String,
    title: String,
    posterPath: String,
    scheduledFor: Date,
    selectedAt: Date,
  },
  { _id: false }
);

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      default: "",
      maxlength: 400,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    watchlist: [clubMovieSchema],
    nextMovieNight: {
      type: nextMovieNightSchema,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);
