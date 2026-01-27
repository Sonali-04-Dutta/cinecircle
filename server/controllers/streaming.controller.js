import axios from "axios";

export const getStreamingProviders = async (req, res) => {
  try {
    const movieId = req.params.id;

    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/movie/${movieId}/watch/providers`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
