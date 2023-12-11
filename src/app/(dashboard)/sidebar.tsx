"use client";

import Image from "next/image";
// redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// constants
import { LAYOUT } from "@/lib/constants";
// components
import { Button } from "../../components/ui/button";
import Iconify from "../../components/ui/icon";
import AccountPopover from "./account-popover";
import NavItem from "./nav-item";
import { useCallback } from "react";
import { toggleCollapseSidebar } from "@/redux/slices/layoutSlice";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { navItems, isCollapsed } = useAppSelector((state) => state.layout);

  const dispatch = useAppDispatch();

  const handleToggleCollapse = useCallback(() => {
    dispatch(toggleCollapseSidebar());
  }, []);

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
      <div className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <AccountPopover />
    </div>
  );
}
