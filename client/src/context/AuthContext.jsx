import { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sceneit_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const login = (data) => {
    localStorage.setItem("sceneit_user", JSON.stringify(data));
    setUser(data);
  };

  const loginWithGoogle = async (accessToken) => {
    try {
      const res = await api.post("/api/auth/google", { accessToken });
      login(res.data);
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("sceneit_user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updatedUser = { ...user, ...data };
    localStorage.setItem("sceneit_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
