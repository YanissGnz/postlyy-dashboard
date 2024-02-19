import React from "react";
import { EUserType } from "@/types/EUserType";
import { ETiers } from "@/types/ETiers";
import NavItem from "./nav-item";
import { getServerAuthSession } from "@/server/auth";

export type TNavItem = {
  name: string;
  path: string;
  icon: string;
  children?: TNavItem[];
  roles: EUserType[];
  tiers: ETiers[];
  needAccount?: boolean;
};

const navItems = [
  {
    name: "Home",
    path: "/home",
    icon: "solar:home-smile-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
  },
  {
    name: "Team",
    path: "/team",
    icon: "solar:users-group-rounded-bold-duotone",
    roles: [EUserType.Manager, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
  },
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
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: "solar:calendar-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Brainstorm",
    path: "/notes",
    icon: "solar:lightbulb-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Templates",
    path: "/templates",
    icon: "solar:documents-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Drafts",
    path: "/drafts",
    icon: "solar:file-text-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Powerups",
    path: "/powerups",
    icon: "solar:bolt-circle-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Basic, ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
  {
    name: "Image to text",
    path: "/image-to-text",
    icon: "solar:magic-stick-3-bold-duotone",
    roles: [EUserType.Manager, EUserType.TeamMember, EUserType.Owner],
    tiers: [ETiers.Pro, ETiers.Expert],
    needAccount: true,
  },
];

export default async function Navigation() {
  const session = await getServerAuthSession();
  const user = session?.user;

  if (!user) return null;

  return navItems
    .filter(
      (item) =>
        item.roles.includes(user.userType) &&
        item.tiers.includes(user.tier) &&
        (item.needAccount ? user.accounts.length > 0 : true),
    )
    .map((item) => <NavItem {...item} />);
}
