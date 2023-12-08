"use client";

import React, { useEffect, useState } from "react";
// next
import { usePathname } from "next/navigation";
import Link from "next/link";
// redux
import { useAppSelector } from "@/redux/hooks";
// components
import Iconify from "../../components/ui/icon";
// utils
import { type TNavItem } from "@/redux/slices/layoutSlice";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

export default function NavItem({ icon, name, path }: TNavItem) {
  const pathname = usePathname();

  const isActive = pathname?.includes(path);

  const { isCollapsed } = useAppSelector((state) => state.layout);
  const [showName, setShowName] = useState(true);

  useEffect(() => {
    if (isCollapsed) {
      setTimeout(() => {
        setShowName(false);
      }, 500);
    } else {
      setShowName(true);
    }
  }, [isCollapsed]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Link
            href={path}
            className={cn(
              "flex w-full cursor-pointer flex-row items-center gap-2 rounded p-2 transition-all",
              isActive
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-foreground/80 hover:bg-accent",
              !showName && "aspect-square justify-center p-1",
            )}
          >
            <Iconify
              icon={icon}
              height={isCollapsed ? 26 : 20}
              className="transition-all"
            />
            <span
              className={cn(
                "origin-left truncate",
                isActive && "font-semibold",
                isCollapsed ? "scale-0" : "scale-100",
                showName ? "block" : "hidden",
              )}
            >
              {name}
            </span>
          </Link>
        </TooltipTrigger>

        <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
          <h1 className="p-1 text-[16px] font-semibold">{name}</h1>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
