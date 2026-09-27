import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  theme: "light" | "dark" | "system";
  isSidebarOpen: boolean;
  searchQuery: string;
}

const initialState: UIState = {
  theme: "dark",
  isSidebarOpen: false,
  searchQuery: "",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
