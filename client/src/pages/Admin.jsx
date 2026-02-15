import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PageTransition from "../components/layout/PageTransition";
import { toast } from "react-hot-toast";

const defaultStats = {
  users: 0,
  reviews: 0,
  messages: 0,
  reminders: 0,
  watchlistItems: 0,
  clubs: 0,
  availabilityAlerts: 0,
  newUsersLast7Days: 0,
  newReviewsLast7Days: 0,
};

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [stats, setStats] = useState(defaultStats);
  const [usersData, setUsersData] = useState({ users: [], page: 1, pages: 1, total: 0 });
  const [reviewsData, setReviewsData] = useState({ reviews: [], page: 1, pages: 1, total: 0 });
  const [userSearch, setUserSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const { data } = await api.get("/api/admin/stats");
      setStats(data);
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, q = "") => {
    try {
      setLoadingUsers(true);
      const { data } = await api.get(`/api/admin/users?page=${page}&limit=10&q=${encodeURIComponent(q)}`);
      setUsersData(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchReviews = useCallback(async (page = 1, q = "") => {
    try {
      setLoadingReviews(true);
      const { data } = await api.get(`/api/admin/reviews?page=${page}&limit=10&q=${encodeURIComponent(q)}`);
      setReviewsData(data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
      fetchUsers(1, "");
      fetchReviews(1, "");
    }
  }, [user, fetchStats, fetchUsers, fetchReviews]);

  const updateRole = async (targetUser, role) => {
    try {
      await api.put(`/api/admin/users/${targetUser._id}/role`, { role });
      toast.success(`Role updated to ${role}`);
      fetchUsers(usersData.page, userSearch);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (targetUser) => {
    if (!window.confirm(`Delete user "${targetUser.name}"? This action is permanent.`)) return;

    try {
      await api.delete(`/api/admin/users/${targetUser._id}`);
      toast.success("User deleted");
      fetchUsers(usersData.page, userSearch);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await api.delete(`/api/admin/reviews/${reviewId}`);
      toast.success("Review deleted");
      fetchReviews(reviewsData.page, reviewSearch);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  const statCards = [
    { label: "Total Users", value: stats.users },
    { label: "Total Reviews", value: stats.reviews },
    { label: "Total Messages", value: stats.messages },
    { label: "Total Reminders", value: stats.reminders },
    { label: "Watchlist Items", value: stats.watchlistItems },
    { label: "Movie Clubs", value: stats.clubs },
    { label: "Availability Alerts", value: stats.availabilityAlerts },
    { label: "Users (7 days)", value: stats.newUsersLast7Days },
    { label: "Reviews (7 days)", value: stats.newReviewsLast7Days },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Admin Panel</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage platform health, users, and reviews.
              </p>
            </div>
            <button
              onClick={() => {
                fetchStats();
                fetchUsers(usersData.page, userSearch);
                fetchReviews(reviewsData.page, reviewSearch);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Refresh
            </button>
          </header>

          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
            {["overview", "users", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold capitalize ${
                  activeTab === tab
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <section>
              {loadingStats ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {card.label}
                      </p>
                      <p className="text-3xl font-extrabold mt-2">{card.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "users" && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name/email"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => fetchUsers(1, userSearch)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Search
                </button>
              </div>

              {loadingUsers ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Verified</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.users.map((u) => (
                        <tr key={u._id} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="px-4 py-3">{u.name}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                u.role === "admin"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{u.isVerified ? "Yes" : "No"}</td>
                          <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={() => updateRole(u, u.role === "admin" ? "user" : "admin")}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded"
                            >
                              Make {u.role === "admin" ? "User" : "Admin"}
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {usersData.users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Total: {usersData.total}</p>
                <div className="flex gap-2">
                  <button
                    disabled={usersData.page <= 1}
                    onClick={() => fetchUsers(usersData.page - 1, userSearch)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 text-sm">
                    {usersData.page} / {usersData.pages}
                  </span>
                  <button
                    disabled={usersData.page >= usersData.pages}
                    onClick={() => fetchUsers(usersData.page + 1, userSearch)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "reviews" && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews by title/comment"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => fetchReviews(1, reviewSearch)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Search
                </button>
              </div>

              {loadingReviews ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewsData.reviews.map((review) => (
                    <article
                      key={review._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-lg">{review.movieTitle || review.movieId}</h3>
                          <p className="text-sm text-slate-500">
                            by {review.user?.name || "Unknown"} ({review.user?.email || "N/A"})
                          </p>
                          <p className="text-sm mt-2">{review.comment}</p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded"
                          >
                            Delete Review
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {reviewsData.reviews.length === 0 && (
                    <div className="text-center py-10 text-slate-500">No reviews found.</div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Total: {reviewsData.total}</p>
                <div className="flex gap-2">
                  <button
                    disabled={reviewsData.page <= 1}
                    onClick={() => fetchReviews(reviewsData.page - 1, reviewSearch)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 text-sm">
                    {reviewsData.page} / {reviewsData.pages}
                  </span>
                  <button
                    disabled={reviewsData.page >= reviewsData.pages}
                    onClick={() => fetchReviews(reviewsData.page + 1, reviewSearch)}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Admin;
