"use client";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback } from "react";
// redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleCollapseSidebar } from "@/redux/slices/layoutSlice";
// constants
import { LAYOUT } from "@/lib/constants";
// components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import Iconify from "../../../components/ui/icon";
import AccountPopover from "./account-popover";
import NavItem from "./nav-item";

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
      className="fixed left-0 top-0 flex h-screen flex-col border-r bg-card transition-all duration-500"
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
            isCollapsed && "rotate-180",
          )}
          fontSize={20}
        />
      </Button>
      <div className="mb-4 p-3 pb-0">
        <Image
          src="/icons/logo-transparent.png"
          alt="logo"
          width="64"
          height="64"
        />
      </div>
      <ScrollArea
        className="px-3"
        style={{
          height: "calc(100% - 100px)",
        }}
      >
        <div className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <div className="w-full space-y-2">
              {!isCollapsed && <h6>{item.name}</h6>}
              <div className="w-full">
                {item.children.map((nav) => (
                  <div className={cn("w-full", !isCollapsed && "ml-2")}>
                    {nav.needAccount
                      ? nav.roles.includes(session.data.user.userType) &&
                        session.data.user.accounts.length > 0 && (
                          <NavItem key={nav.path} {...nav} />
                        )
                      : nav.roles.includes(session.data.user.userType) && (
                          <NavItem key={nav.path} {...nav} />
                        )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="px-3 pb-3">
        <AccountPopover />
      </div>
    </div>
  );
}
