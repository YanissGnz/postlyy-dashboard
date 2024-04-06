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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "../../../components/ui/button";
import Iconify from "../../../components/ui/icon";
import AccountPopover from "./account-popover";
import NavItem from "./nav-item";

export default function Sidebar() {
  const session = useSession();

  const { navItems, isCollapsed } = useAppSelector((state) => state.layout);

  const [collapsed, setCollapsed] = useLocalStorage<string[]>("collapsed", [
    "0",
  ]);

  const dispatch = useAppDispatch();

  const handleToggleCollapse = useCallback(() => {
    dispatch(toggleCollapseSidebar());
  }, []);

  if (!session.data) {
    return null;
  }

  return (
    <div
      className="menu fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-card transition-all duration-500"
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
      <div className="mb-2 flex items-center gap-2 p-3 pb-0">
        <Image
          src="/icons/logo-transparent.png"
          alt="logo"
          width={isCollapsed ? "64" : 50}
          height={isCollapsed ? "64" : 50}
        />
        <h1
          className={cn(
            "origin-left text-2xl font-bold text-foreground transition-all duration-500",
            isCollapsed ? "scale-0" : "scale-100",
          )}
        >
          Postlyy
        </h1>
      </div>
      <ScrollArea
        className="mb-2 px-3"
        style={{
          height: "calc(100% - 100px)",
        }}
      >
        <Accordion
          type="multiple"
          value={
            isCollapsed
              ? Array.from({ length: navItems.length }, (_, i) => i.toString())
              : collapsed
          }
          onValueChange={setCollapsed}
        >
          {navItems.map((item, groupIndex) => (
            <div key={item.name} className="w-full space-y-2">
              <AccordionItem
                value={groupIndex.toString()}
                className="border-none"
              >
                {!isCollapsed && (
                  <AccordionTrigger className="w-full hover:no-underline">
                    <div
                      className={cn(
                        "flex w-full items-center justify-between",
                        "text-muted-foreground",
                      )}
                    >
                      <h6 className="mb-1 font-semibold ">{item.name}</h6>
                    </div>
                  </AccordionTrigger>
                )}
                <AccordionContent className="w-full space-y-1 pb-1">
                  {item.children.map((nav) => (
                    <div className={cn("w-full", !isCollapsed && "pl-2")}>
                      {nav.roles.includes(session.data.user.userType) && (
                        <NavItem key={nav.path} {...nav} />
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </ScrollArea>
      <div className="px-3 pb-3">
        <AccountPopover />
      </div>
    </div>
  );
}
