import { createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import {setUser,setAuthLoading} from "../features/auth/authSlice";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  async function login(credentials) {
    dispatch(setAuthLoading(true));

    try {
      const response = await api.post("/auth/login", credentials);

      const loggedInUser =
        response.data?.data?.user ||
        response.data?.user ||
        response.data?.data;

      if (!loggedInUser || !loggedInUser.role) {
        throw new Error("Login response mein user details nahi mili.");
      }

      dispatch(setUser(loggedInUser));
      return response;
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  async function register(details) {
    dispatch(setAuthLoading(true));

    try {
      return await api.post("/auth/register", details);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      dispatch(setUser(null));
    }
  }

  const value = {
    user,
    setUser: (nextUser) => dispatch(setUser(nextUser)),
    loading,
    setLoading: (value) => dispatch(setAuthLoading(value)),
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