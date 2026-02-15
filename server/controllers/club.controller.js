import Club from "../models/Club.js";
import User from "../models/User.js";

const isMember = (club, userId) =>
  club.members.some((memberId) => memberId.toString() === userId.toString());

const isOwner = (club, userId) => club.owner.toString() === userId.toString();

const populateClub = async (clubId, userId) => {
  return Club.findOne({ _id: clubId, members: userId })
    .populate("owner", "name email avatar")
    .populate("members", "name email avatar")
    .populate("watchlist.addedBy", "name avatar");
};

export const createClub = async (req, res) => {
  try {
    const { name, description = "", memberIds = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Club name is required" });
    }

    const me = await User.findById(req.user._id).select("friends");
    const uniqueMemberIds = [...new Set((memberIds || []).map((id) => String(id)))];
    const validFriendIds = uniqueMemberIds.filter((id) =>
      me.friends.some((friendId) => friendId.toString() === id)
    );

    const club = await Club.create({
      name: name.trim(),
      description: description.trim(),
      owner: req.user._id,
      members: [req.user._id, ...validFriendIds],
    });

    const fullClub = await populateClub(club._id, req.user._id);
    return res.status(201).json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ members: req.user._id })
      .populate("owner", "name avatar")
      .sort({ updatedAt: -1 });

    return res.json(clubs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getClubById = async (req, res) => {
  try {
    const club = await populateClub(req.params.id, req.user._id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    return res.json(club);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addClubMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }
    if (!isOwner(club, req.user._id)) {
      return res.status(403).json({ message: "Only owner can add members" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isMember(club, userId)) {
      return res.status(400).json({ message: "User is already in this club" });
    }

    const owner = await User.findById(req.user._id).select("friends");
    const isFriendOfOwner = owner.friends.some((friendId) => friendId.toString() === userId);
    if (!isFriendOfOwner) {
      return res.status(400).json({ message: "You can only add your friends to club" });
    }

    club.members.push(userId);
    await club.save();

    const fullClub = await populateClub(club._id, req.user._id);
    return res.json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeClubMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.owner.toString() === userId) {
      return res.status(400).json({ message: "Club owner cannot be removed" });
    }

    const requesterIsOwner = isOwner(club, req.user._id);
    const requesterIsSelf = req.user._id.toString() === userId;
    if (!requesterIsOwner && !requesterIsSelf) {
      return res.status(403).json({ message: "Not allowed to remove this member" });
    }

    club.members = club.members.filter((memberId) => memberId.toString() !== userId);
    club.watchlist.forEach((movie) => {
      movie.votes = movie.votes.filter((voteUserId) => voteUserId.toString() !== userId);
    });

    await club.save();

    const fullClub = await populateClub(club._id, req.user._id);
    return res.json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addMovieToClubWatchlist = async (req, res) => {
  try {
    const { movieId, title, posterPath = "", releaseDate = "" } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: "movieId and title are required" });
    }

    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }

    const alreadyExists = club.watchlist.some((movie) => movie.movieId === movieId);
    if (alreadyExists) {
      return res.status(400).json({ message: "Movie already in club watchlist" });
    }

    club.watchlist.push({
      movieId,
      title,
      posterPath,
      releaseDate,
      addedBy: req.user._id,
      votes: [],
    });
    await club.save();

    const fullClub = await populateClub(club._id, req.user._id);
    return res.status(201).json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const removeMovieFromClubWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;
    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }

    club.watchlist = club.watchlist.filter((movie) => movie.movieId !== movieId);
    await club.save();

    const fullClub = await populateClub(club._id, req.user._id);
    return res.json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const toggleClubMovieVote = async (req, res) => {
  try {
    const { movieId } = req.params;
    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }

    const movie = club.watchlist.find((item) => item.movieId === movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found in club watchlist" });
    }

    const voteIndex = movie.votes.findIndex(
      (voteUserId) => voteUserId.toString() === req.user._id.toString()
    );
    if (voteIndex > -1) {
      movie.votes.splice(voteIndex, 1);
    } else {
      movie.votes.push(req.user._id);
    }

    await club.save();
    const fullClub = await populateClub(club._id, req.user._id);
    return res.json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const selectNextMovieNight = async (req, res) => {
  try {
    const { scheduledFor = null } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club || !isMember(club, req.user._id)) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (!isOwner(club, req.user._id)) {
      return res.status(403).json({ message: "Only owner can finalize next movie night" });
    }

    if (!club.watchlist.length) {
      return res.status(400).json({ message: "Club watchlist is empty" });
    }

    const topMovie = [...club.watchlist].sort((a, b) => b.votes.length - a.votes.length)[0];

    club.nextMovieNight = {
      movieId: topMovie.movieId,
      title: topMovie.title,
      posterPath: topMovie.posterPath,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      selectedAt: new Date(),
    };

    await club.save();
    const fullClub = await populateClub(club._id, req.user._id);
    return res.json(fullClub);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
