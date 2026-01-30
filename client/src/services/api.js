import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
<<<<<<< HEAD
  const storedUser = localStorage.getItem("user") || localStorage.getItem("sceneit_user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
=======
  const storedUser = localStorage.getItem("sceneit_user") || localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const token = parsed.token || parsed; 
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      // If it's not valid JSON, it might be the raw token string
      config.headers.Authorization = `Bearer ${storedUser}`;
>>>>>>> 888e83e (added more features)
    }
  }
  return config;
});

export default api;
