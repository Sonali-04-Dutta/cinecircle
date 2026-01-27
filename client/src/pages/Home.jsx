import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Recommendations from "../components/movie/Recommendations";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState(null);

  // 📰 Load friends activity feed
  useEffect(() => {
    if (user) {
      setLoadingFeed(true);
      api
        .get("/api/reviews/feed/friends")
        .then((res) => setFeed(res.data))
        .catch(() => setFeed([])) // Fail silently for feed to keep UI clean
        .finally(() => setLoadingFeed(false));
    }
  }, [user]);

  const searchMovies = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setError(null);
    try {
      const res = await api.get(`/api/movies/search?q=${query}`);
      setMovies(res.data);
    } catch (err) {
      setError("Failed to search movies. Please try again.");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4 drop-shadow-lg">
            🎬 CineCircle
          </h1>
          <p className="text-gray-400 text-xl">Discover, Track, and Share your favorite movies.</p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-8 flex justify-between items-center max-w-2xl mx-auto">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* 🔍 Search */}
        <div className="flex justify-center gap-4 mb-16">
          <input
            className="w-full max-w-2xl bg-gray-800 text-white border border-gray-700 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-lg text-lg placeholder-gray-500"
            placeholder="Search for movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMovies()}
          />
          <button
            onClick={searchMovies}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            Search
          </button>
        </div>

        {/* 🎥 Search Results */}
        {loadingSearch ? (
          <div className="flex justify-center items-center h-32 mb-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
          </div>
        ) : movies.length > 0 && (
          <section className="mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 border-l-4 border-red-500 pl-4">🎥 Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {movies.map((movie) => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="group">
                  <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full flex flex-col border border-gray-700">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Image"}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-red-400 transition-colors">{movie.title}</h3>
                      <p className="text-gray-500 text-sm">{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 🤖 Recommendations */}
        {user && <div className="mb-16"><Recommendations /></div>}

        {/* 📰 Friends Activity Feed */}
        {loadingFeed ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : user && feed.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 border-l-4 border-blue-500 pl-4">📰 Friends Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feed.map((r) => (
                <div key={r._id} className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl mr-4 shadow-inner">
                      {r.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white">{r.user.name}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Rated a movie</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-3 bg-gray-900/50 p-2 rounded-lg w-fit">
                    <span className="text-yellow-400 text-xl mr-2">⭐</span>
                    <span className="font-bold text-xl text-white">{r.rating}<span className="text-sm text-gray-500">/10</span></span>
                  </div>
                  <p className="text-gray-300 italic leading-relaxed">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
