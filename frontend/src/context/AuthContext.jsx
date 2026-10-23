
import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  async function login(credentials) {
    const response = await api.post("/auth/login", credentials);

    const loggedInUser =
      response.data?.data?.user ||
      response.data?.user ||
      response.data?.data;

    if (!loggedInUser || !loggedInUser.role) {
      throw new Error("Login response mein user details nahi mili.");
    }

    setUser(loggedInUser);
    return response;
  }

  async function register(details) {
    return api.post("/auth/register", details);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  }

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
