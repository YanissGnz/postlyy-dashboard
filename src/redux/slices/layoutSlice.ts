import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TNavItem = {
  name: string;
  path: string;
  icon: string;
  children?: TNavItem[];
};

type LayoutState = {
  isCollapsed: boolean;
  navItems: TNavItem[];
  isMobileSidebarOpen: boolean;
};

const initialState = {
  isCollapsed: false,
  navItems: [
    {
      name: "Post",
      path: "/post",
      icon: "solar:pen-new-square-bold-duotone",
    },
    {
      name: "Queue",
      path: "/queue",
      icon: "solar:calendar-add-bold-duotone",
    },
    {
      name: "Powerups",
      path: "/powerups",
      icon: "solar:bolt-circle-bold-duotone",
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: "solar:calendar-bold-duotone",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "solar:pie-chart-2-bold-duotone",
    },
    {
      name: "Recurrent Posts",
      path: "/settings",
      icon: "solar:repeat-one-minimalistic-bold-duotone",
    },
  ],
  isMobileSidebarOpen: false,
} as LayoutState;

export const layout = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleCollapseSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    openMobileSidebar: (state) => {
      state.isMobileSidebarOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.isMobileSidebarOpen = false;
    },
  },
});

export const { toggleCollapseSidebar, closeMobileSidebar, openMobileSidebar } =
  layout.actions;
export default layout.reducer;
