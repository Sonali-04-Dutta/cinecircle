import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

const Friends = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get("/api/friends");
        setFriends(res.data);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchFriends();
  }, [user]);

  // 🔔 Listen for real-time messages to update unread counts
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      // Only update if the message is for the current user
      if (msg.receiver === user._id) {
        setFriends((prevFriends) =>
          prevFriends.map((friend) => {
            if (friend._id === msg.sender) {
              return {
                ...friend,
                unreadCount: (friend.unreadCount || 0) + 1,
              };
            }
            return friend;
          })
        );
      }
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [socket, user]);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    return `${baseUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-indigo-500 pl-4">Friends</h1>
        
        {friends.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xl">You haven't added any friends yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Link
                key={friend._id}
                to={`/chat/${friend._id}`}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {friend.avatar ? (
                        <img 
                          src={getAvatarUrl(friend.avatar)} 
                          alt={friend.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`; }}
                        />
                      ) : (
                        friend.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {friend.name}
                    </h3>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>

                {friend.unreadCount > 0 && (
                  <div className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-rose-500/30">
                    {friend.unreadCount}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;