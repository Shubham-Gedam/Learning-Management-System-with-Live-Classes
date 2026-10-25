import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })(),
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;

      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;