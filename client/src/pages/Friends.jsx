import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = () => {
    setLoading(true);
    api.get("/api/friends")
      .then((res) => setFriends(res.data))
      .catch(() => setError("Failed to load friends list."))
      .finally(() => setLoading(false));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/api/search/users?q=${query}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const addFriend = async (userId) => {
    try {
      await api.post(`/api/friends/${userId}`);
      loadFriends(); // Refresh friends list
      setSearchResults((prev) => prev.filter((u) => u._id !== userId)); // Remove from search results
      setQuery("");
    } catch (err) {
      alert("Failed to add friend. " + (err.response?.data?.message || ""));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-10 border-b border-gray-700 pb-4 flex items-center">
          <span className="mr-3">🤝</span> Friends
        </h1>

        {/* 🔍 Find Users Section */}
        <div className="mb-8 md:mb-12 bg-gray-800/50 p-4 md:p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🔍</span> Find Users
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search users by name..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 md:px-5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 w-full sm:w-auto"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              {searchResults.map((user) => (
                <div key={user._id} className="flex items-center justify-between bg-gray-700/50 p-3 md:p-4 rounded-xl border border-gray-600">
                  <div className="flex items-center overflow-hidden">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white mr-3 shadow-sm shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-100 truncate">{user.name}</span>
                  </div>
                  <button
                    onClick={() => addFriend(user._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-colors shadow-sm shrink-0 ml-2"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-200 hover:text-white font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-400"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-2xl text-gray-400">You haven't added any friends yet.</p>
            <p className="text-gray-400 mt-2">Use the search above to find people to connect with!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {friends.map((f) => (
              <Link
                key={f._id}
                to={`/chat/${f._id}`}
                className="flex items-center p-4 md:p-5 bg-gray-800 rounded-xl hover:bg-gray-750 transition-all shadow-md hover:shadow-lg border border-gray-700 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg md:text-xl mr-4 md:mr-5 shadow-sm shrink-0">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    f.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-lg md:text-xl group-hover:text-blue-400 transition-colors truncate">{f.name}</h3>
                  <p className="text-xs md:text-sm text-gray-400 group-hover:text-gray-300 truncate">Click to start chatting</p>
                </div>
                <div className="text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all text-xl md:text-2xl ml-2">
                  💬
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
