import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/src/types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  activeProfileId: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      activeProfileId: null,
    };
  }

  try {
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("user");
    const activeProfileId = localStorage.getItem("active_profile_id");
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      isAuthenticated: Boolean(token && user),
      token,
      refreshToken,
      activeProfileId,
    };
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      activeProfileId: null,
    };
  }
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token?: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;

      if (action.payload.token) {
        state.token = action.payload.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", action.payload.token);
        }
      }

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", action.payload.refreshToken);
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    setActiveProfile: (state, action: PayloadAction<string>) => {
      state.activeProfileId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("active_profile_id", action.payload);
      }
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.activeProfileId = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("active_profile_id");
      }
    },
  },
});

export const { setCredentials, setActiveProfile, logout } = authSlice.actions;
export default authSlice.reducer;
