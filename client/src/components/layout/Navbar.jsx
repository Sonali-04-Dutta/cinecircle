import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import { SocketContext } from "../../context/SocketContext";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount, setUnreadCount } = useContext(NotificationContext);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (user && socket) {
      const handleNotification = (data) => {
        // 🔊 Play notification sound
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.log("Audio play blocked or failed", err));

        setUnreadCount((prev) => prev + 1);

        const message = data.type === "like"
          ? `❤️ ${data.senderName} liked your review for ${data.movieTitle}`
          : data.type === "mention"
          ? `📣 ${data.senderName} mentioned you in a comment on ${data.movieTitle}`
          : `💬 ${data.senderName} commented on your review for ${data.movieTitle}`;

        toast(message, {
          icon: "🔔",
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        });
      };

      socket.on("getNotification", handleNotification);
      return () => socket.off("getNotification", handleNotification);
    }
  }, [user, socket, setUnreadCount]);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <Link to="/" className="text-2xl font-black text-red-500 tracking-tighter hover:text-red-400 transition-colors">
        CineCircle
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/" className="text-gray-300 hover:text-white font-medium transition-colors">Home</Link>
            <Link to="/watchlist" className="text-gray-300 hover:text-white font-medium transition-colors">Watchlist</Link>
            <Link to="/friends" className="text-gray-300 hover:text-white font-medium transition-colors">Friends</Link>
            
            {/* 🔔 Notification Icon */}
            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors group">
              <span className="text-xl group-hover:scale-110 inline-block transition-transform">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-[10px] font-bold text-white items-center justify-center border-2 border-gray-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </Link>

            <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-gray-700 hover:border-red-500 transition-all overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
            <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-lg">
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;