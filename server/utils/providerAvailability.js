import axios from "axios";

const normalize = (value = "") => String(value).trim().toLowerCase();

const getProviderGroups = (regionData = {}) => {
  return [
    ...(regionData.flatrate || []),
    ...(regionData.rent || []),
    ...(regionData.buy || []),
  ];
};

export const resolveTmdbMovieId = async (movieId) => {
  const raw = String(movieId || "").trim();
  if (!raw) return null;
  if (!raw.startsWith("tt")) return raw;

  if (!process.env.TMDB_BASE_URL || !process.env.TMDB_API_KEY) {
    return null;
  }

  const findResponse = await axios.get(`${process.env.TMDB_BASE_URL}/find/${raw}`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
      external_source: "imdb_id",
    },
  });

  const match = findResponse.data?.movie_results?.[0];
  return match?.id ? String(match.id) : null;
};

export const fetchProvidersByRegion = async (movieId, region = "IN") => {
  if (!process.env.TMDB_BASE_URL || !process.env.TMDB_API_KEY) {
    return { providers: [], link: "", available: false, resolvedMovieId: null };
  }

  const resolvedMovieId = await resolveTmdbMovieId(movieId);
  if (!resolvedMovieId) {
    return { providers: [], link: "", available: false, resolvedMovieId: null };
  }

  const response = await axios.get(
    `${process.env.TMDB_BASE_URL}/movie/${resolvedMovieId}/watch/providers`,
    {
      params: { api_key: process.env.TMDB_API_KEY },
    }
  );

  const allRegions = response.data?.results || {};
  const regionData = allRegions[region] || null;
  if (!regionData) {
    return { providers: [], link: "", available: false, resolvedMovieId };
  }

  const providers = getProviderGroups(regionData);
  return {
    providers,
    link: regionData.link || "",
    available: providers.length > 0,
    resolvedMovieId,
  };
};

export const checkProviderAvailability = async ({
  movieId,
  region = "IN",
  providerName = "",
  providerId = null,
}) => {
  const { providers, link, resolvedMovieId } = await fetchProvidersByRegion(movieId, region);
  if (!providers.length) {
    return { isAvailable: false, matchedProvider: null, link, resolvedMovieId };
  }

  const normalizedName = normalize(providerName);
  const matchedProvider = providers.find((provider) => {
    if (providerId && Number(provider.provider_id) === Number(providerId)) {
      return true;
    }
    if (!normalizedName) return false;
    return normalize(provider.provider_name) === normalizedName;
  });

  return {
    isAvailable: Boolean(matchedProvider),
    matchedProvider: matchedProvider || null,
    link,
    resolvedMovieId,
  };
};
