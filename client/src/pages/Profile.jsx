import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", avatar: "" });

  useEffect(() => {
    api.get("/api/users/profile")
      .then((res) => {
        setProfile(res.data);
        setFormData({ name: res.data.name, avatar: res.data.avatar || "" });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put("/api/users/profile", formData);
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 border-b border-gray-700 pb-4 flex items-center">
          <span className="mr-3">👤</span> My Profile
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        ) : profile ? (
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
            
            <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gray-900 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-3xl font-bold text-white shadow-inner overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2 shadow-md"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="text-sm text-gray-400 mb-1">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="mb-6 space-y-3 max-w-md">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Display Name"
                  />
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Avatar URL"
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-bold text-white mb-1">{profile.name}</h2>
              )}
              <p className="text-gray-400 mb-8">{profile.email}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50 flex items-center">
                  <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-white">{profile.friends?.length || 0}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-wide">Friends</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400">Failed to load profile data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
