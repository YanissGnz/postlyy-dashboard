import { type HTMLProps } from "react";
import { LAYOUT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useMediaQuery } from "usehooks-ts";

export default function BottomButtons({
  children,
  style,
  className,
  ...props
}: HTMLProps<HTMLDivElement>) {
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className={cn(
        "fixed bottom-0 z-10 flex w-full items-center gap-2 bg-background p-2 transition-all duration-500",
        className,
      )}
      style={{
        left: isMobile
          ? 0
          : isCollapsed
            ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
            : LAYOUT.SIDEBAR_WIDTH,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
