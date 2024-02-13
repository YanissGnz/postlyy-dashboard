import { EUserType } from "@/types/EUserType";
import { createSlice } from "@reduxjs/toolkit";

export type TNavItem = {
  name: string;
  path: string;
  icon: string;
  children?: TNavItem[];
  roles: EUserType[];
  needAccount?: boolean;
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
      name: "Home",
      path: "/home",
      icon: "solar:home-smile-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    },
    // {
    //   name: "Team",
    //   path: "/team",
    //   icon: "solar:users-group-rounded-bold-duotone",
    //   roles: [EUserType.Manager, EUserType.Owner],
    // },
    // {
    //   name: "Team Analytics",
    //   path: "/team-analytics",
    //   icon: "solar:round-graph-bold-duotone",
    //   roles: [EUserType.Manager, EUserType.Owner],
    // },
    {
      name: "Post",
      path: "/post",
      icon: "solar:pen-new-square-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: "solar:calendar-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Brainstorm",
      path: "/notes",
      icon: "solar:lightbulb-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Templates",
      path: "/templates",
      icon: "solar:documents-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Drafts",
      path: "/drafts",
      icon: "solar:file-text-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Powerups",
      path: "/powerups",
      icon: "solar:bolt-circle-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
    },
    {
      name: "Image to text",
      path: "/image-to-text",
      icon: "solar:magic-stick-3-bold-duotone",
      roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
      needAccount: true,
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
