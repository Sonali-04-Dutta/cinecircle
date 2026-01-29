import { useEffect, useState } from "react";
import api from "../services/api";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

const Notifications = () => {
  const { setUnreadCount } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await api.get(`/api/notifications?page=${pageNum}&limit=10`);
      const { notifications: newNotifications, hasMore: moreAvailable } = res.data;
      
      setNotifications(prev => isLoadMore ? [...prev, ...newNotifications] : newNotifications);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-center justify-between border-b border-gray-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <span className="text-red-500">🔔</span> Notifications
          </h1>
          <div className="flex items-center gap-4">
            {notifications.some(n => !n.read) && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold uppercase tracking-wider"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <span className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-gray-400 border border-gray-700">
                {notifications.length} Total
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-500 animate-pulse">Loading your activity...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-gray-800/20 rounded-3xl border border-gray-800 border-dashed flex flex-col items-center">
            <span className="text-6xl mb-4 opacity-20">📭</span>
            <p className="text-2xl text-gray-500 font-light">Your inbox is empty</p>
            <p className="text-gray-400 mt-2">Interactions from your friends will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => !n.read && markAsRead(n._id)}
                className={`group p-5 rounded-2xl border transition-all duration-300 ${
                  n.read 
                    ? "bg-gray-800/30 border-gray-800 hover:bg-gray-800/50" 
                    : "bg-gray-800 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)] hover:border-red-500/40"
                } ${!n.read ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                      {n.sender?.avatar ? (
                        <img 
                          src={n.sender.avatar} 
                          alt={n.sender.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.name || 'User')}&background=random`; }}
                        />
                      ) : (
                        n.sender?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-gray-900 ${
                      n.type === 'like' ? 'bg-blue-500' : n.type === 'mention' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {n.type === 'like' ? '👍' : n.type === 'mention' ? '📣' : '💬'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 leading-relaxed">
                      <span className="font-bold text-white">
                        {n.sender?.name || "A user"}
                      </span>{" "}
                      {n.type === "like" ? "liked your review for" : n.type === "mention" ? "mentioned you in a comment on" : "commented on your review for"}{" "}
                      <Link 
                        to={`/movie/${n.reviewId?.movieId || n.reviewId}`} 
                        className="text-red-500 hover:text-red-400 font-bold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!n.read) markAsRead(n._id);
                        }}
                      >
                        {n.movieTitle || "a movie"}
                      </Link>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        🕒 {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;