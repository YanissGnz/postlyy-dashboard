"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// next
import Link from "next/link";
import { usePathname } from "next/navigation";
// redux
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// components
import Iconify from "../../../components/ui/icon";
// utils
import { cn } from "@/lib/utils";
import { closeMobileSidebar, type TNavItem } from "@/redux/slices/layoutSlice";
import { useMediaQuery } from "usehooks-ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

export default function NavItem({ icon, name, path }: TNavItem) {
  const pathname = usePathname();

  const paths = useMemo(() => pathname?.split("/").filter(Boolean), [pathname]);

  const isActive = useMemo(() => {
    return paths?.includes(path.split("/")[1] ?? "");
  }, [paths]);

  const { isCollapsed } = useAppSelector((state) => state.layout);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showName, setShowName] = useState(true);

  const dispatch = useAppDispatch();

  const handleToggleCollapse = useCallback(() => {
    dispatch(closeMobileSidebar());
  }, []);

  useEffect(() => {
    if (isCollapsed && !isMobile) {
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
        <TooltipTrigger className="w-full">
          <Link
            href={path}
            onClick={handleToggleCollapse}
            className={cn(
              "flex w-full cursor-pointer flex-row items-center gap-2 rounded p-2 transition-all",
              isActive
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-foreground/80 hover:bg-accent",
              !showName && !isMobile && "aspect-square justify-center p-1",
            )}
          >
            <Iconify
              icon={icon}
              height={!isMobile && isCollapsed ? 26 : 20}
              className="transition-all"
            />
            <span
              className={cn(
                "origin-left truncate",
                isActive && "font-semibold",
                !isMobile && isCollapsed ? "scale-0" : "scale-100",
                showName || isMobile ? "block" : "hidden",
              )}
            >
              {name}
            </span>
          </Link>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          className={cn(!isMobile && !isCollapsed && "hidden")}
        >
          <h1 className="p-1 text-[16px] font-semibold">{name}</h1>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
