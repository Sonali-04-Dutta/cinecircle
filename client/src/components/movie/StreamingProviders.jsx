import { useEffect, useState } from "react";
import axios from "axios";

const StreamingProviders = ({ movieId }) => {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/streaming/${movieId}`
        );

        // Change "IN" to your target country code if needed
        setProviders(res.data.IN || null);
      } catch (err) {
        console.error("Error fetching streaming providers", err);
      }
    };

    fetchProviders();
  }, [movieId]);

  if (!providers) return <p className="text-gray-400 mt-4">No streaming info available.</p>;

  const renderSection = (title, items) => {
    if (!items) return null;

    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-4">
          {items.map((provider) => (
            <a
              key={provider.provider_id}
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:scale-105 transition"
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-14 h-14 rounded-lg shadow-md"
              />
              <span className="text-xs mt-1 text-center">
                {provider.provider_name}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 bg-gray-900 p-4 rounded-xl">
      <h2 className="text-xl font-bold mb-3">📺 Where to Watch</h2>

      {renderSection("🎟 Stream", providers.flatrate)}
      {renderSection("💰 Rent", providers.rent)}
      {renderSection("🛒 Buy", providers.buy)}
    </div>
  );
};

export default StreamingProviders;
