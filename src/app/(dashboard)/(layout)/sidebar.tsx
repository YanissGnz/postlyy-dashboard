"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
// redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleCollapseSidebar } from "@/redux/slices/layoutSlice";
// constants
import { LAYOUT } from "@/lib/constants";
// components
import { Button } from "../../../components/ui/button";
import Iconify from "../../../components/ui/icon";
import AccountPopover from "./account-popover";
import NavItem from "./nav-item";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar() {
  const session = useSession();

  const { navItems, isCollapsed } = useAppSelector((state) => state.layout);

  const dispatch = useAppDispatch();

  const handleToggleCollapse = useCallback(() => {
    dispatch(toggleCollapseSidebar());
  }, []);

  if (!session.data) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 flex h-screen flex-col border-r bg-card p-3 transition-all duration-500"
      style={{
        width: isCollapsed
          ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
          : LAYOUT.SIDEBAR_WIDTH,
      }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleCollapse}
        className="absolute top-5 -translate-x-1/2 rounded-full border transition-all duration-500"
        style={{
          left: isCollapsed
            ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
            : LAYOUT.SIDEBAR_WIDTH,
        }}
      >
        <Iconify
          icon="solar:double-alt-arrow-left-bold-duotone"
          className={cn(
            "transition-transform duration-500",
            isCollapsed ? "rotate-180" : "",
          )}
          fontSize={20}
        />
      </Button>
      <div className="mb-4">
        <Image
          src="/icons/logo-transparent.png"
          alt="logo"
          width="64"
          height="64"
        />
      </div>
      <ScrollArea
        style={{
          height: "calc(100% - 100px)",
        }}
      >
        <div className="flex flex-1 flex-col gap-2">
          {navItems.map((item) =>
            item.needAccount
              ? item.roles.includes(session.data.user.userType) &&
                session.data.user.accounts.length > 0 && (
                  <NavItem key={item.path} {...item} />
                )
              : item.roles.includes(session.data.user.userType) && (
                  <NavItem key={item.path} {...item} />
                ),
          )}
        </div>
      </ScrollArea>

      <AccountPopover />
    </div>
  );
}
