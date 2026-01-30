import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const storedUser =
    localStorage.getItem("sceneit_user") || localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);

      // If user object contains token OR if token itself was stored
      const token = parsed?.token || parsed;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // If stored value is just a raw token string
      config.headers.Authorization = `Bearer ${storedUser}`;
    }
  }

  return config;
});

export default api;