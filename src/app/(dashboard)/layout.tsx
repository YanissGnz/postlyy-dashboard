"use client";

import { useSession } from "next-auth/react";
// constant
import { LAYOUT } from "@/lib/constants";
// hooks
import { useMediaQuery } from "usehooks-ts";
// components
import Sidebar from "@/app/sidebar";
import { useAppSelector } from "@/redux/hooks";
import Header from "@/app/header";
import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const session = useSession();

  if (!session.data?.user.hasChosenSubscription) {
    redirect(ROUTES.setupSubscription);
  }

  return (
    <div className="flex flex-col">
      {isMobile ? <Header /> : <Sidebar />}
      <main
        className="transition-all duration-500"
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
