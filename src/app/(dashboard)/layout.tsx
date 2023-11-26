"use client";

// constant
import { LAYOUT } from "@/lib/constants";
// hooks
import { useMediaQuery } from "usehooks-ts";
// components
import Sidebar from "@/components/layout/Sidebar";
import { useAppSelector } from "@/redux/hooks";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isCollapsed } = useAppSelector((state) => state.layout);

  return (
    <div className="flex flex-col">
      {isMobile ? <Header /> : <Sidebar />}
      <main
        style={{
          paddingLeft: isMobile
            ? 0
            : isCollapsed
              ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
              : LAYOUT.SIDEBAR_WIDTH,
        }}
      >
        {children}
      </main>
    </div>
  );
}
