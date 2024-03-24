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
  navItems: {
    name: string;
    children: TNavItem[];
  }[];
  isMobileSidebarOpen: boolean;
};

const initialState = {
  isCollapsed:
    typeof window !== "undefined"
      ? localStorage.getItem("isCollapsed") === "true" ?? false
      : false,
  navItems: [
    {
      name: "General",
      children: [
        {
          name: "Home",
          path: "/home",
          icon: "solar:home-smile-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
        },
        {
          name: "Team",
          path: "/team",
          icon: "solar:users-group-rounded-bold-duotone",
          roles: [EUserType.Manager, EUserType.Owner],
        },
        {
          name: "Calendar",
          path: "/calendar",
          icon: "solar:calendar-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
          needAccount: true,
        },
        {
          name: "Post history",
          path: "/post-history",
          icon: "solar:history-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
          needAccount: true,
        },
      ],
    },
    {
      name: "Content Creation",
      children: [
        {
          name: "Post",
          path: "/post",
          icon: "solar:pen-new-square-bold-duotone",
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
          name: "Inspiration",
          path: "/inspiration",
          icon: "solar:stars-minimalistic-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
          needAccount: true,
        },
      ],
    },
    {
      name: "Advanced Features",
      children: [
        {
          name: "Powerups",
          path: "/powerups",
          icon: "solar:bolt-circle-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
          needAccount: true,
        },
        {
          name: "Text to Image",
          path: "/text-to-image",
          icon: "solar:magic-stick-3-bold-duotone",
          roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
          needAccount: true,
        },
      ],
    },
  ],
  isMobileSidebarOpen: false,
} as LayoutState;

export const layout = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleCollapseSidebar: (state) => {
      typeof window !== undefined &&
        localStorage.setItem("isCollapsed", (!state.isCollapsed).toString());
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
