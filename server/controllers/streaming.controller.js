import { fetchProvidersByRegion } from "../utils/providerAvailability.js";

export const getStreamingProviders = async (req, res) => {
  try {
    const movieId = req.params.id;
    const region = (req.query.region || process.env.DEFAULT_REGION || "IN").toUpperCase();

    const { providers, link, resolvedMovieId } = await fetchProvidersByRegion(movieId, region);

    return res.json({
      region,
      movieId: resolvedMovieId || movieId,
      link,
      providers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
