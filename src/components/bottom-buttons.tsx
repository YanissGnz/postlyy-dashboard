"use client";

import { LAYOUT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useMemo, type HTMLProps } from "react";
import { useMediaQuery } from "usehooks-ts";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export default function BottomButtons({
  children,
  style,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const width = useMemo(() => {
    if (isMobile) return "100%";
    if (isCollapsed) return `calc(100vw - ${LAYOUT.COLLAPSED_SIDEBAR_WIDTH}px)`;
    return `calc(100vw - ${LAYOUT.SIDEBAR_WIDTH}px)`;
  }, [isMobile, isCollapsed]);

  return (
    <div
      className={cn(
        "fixed bottom-0 z-10 flex w-full items-center gap-2 bg-background transition-all duration-500",
        className,
      )}
      style={{
        left: isMobile
          ? 0
          : isCollapsed
            ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
            : LAYOUT.SIDEBAR_WIDTH,
        width,
        // isMobile
        // ? "100%"
        // : isCollapsed
        //   ? `calc(100vw - ${LAYOUT.COLLAPSED_SIDEBAR_WIDTH})`
        //   : `calc(100vw - ${LAYOUT.SIDEBAR_WIDTH})`,
        ...style,
      }}
      {...props}
    >
      <ScrollArea className="w-full flex-1 p-2">
        {children}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
