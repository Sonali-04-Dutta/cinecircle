import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("sceneit_user"))
  );

  const login = (data) => {
    localStorage.setItem("sceneit_user", JSON.stringify(data));
    setUser(data);
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
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
