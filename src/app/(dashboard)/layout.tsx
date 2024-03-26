"use client";

import { useSession } from "next-auth/react";
// constant
import { LAYOUT } from "@/lib/constants";
// hooks
import { useMediaQuery } from "usehooks-ts";
// components
import Header from "@/app/(dashboard)/(layout)/header";
import Sidebar from "@/app/(dashboard)/(layout)/sidebar";
import { useAppSelector } from "@/redux/hooks";
import { ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AlertsProvider from "../../providers/alerts-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const session = useSession();
  const { replace } = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      replace(ROUTES.login);
      localStorage.removeItem("token");
      return;
    }

    if (
      session.status === "authenticated" &&
      !session.data?.user.hasChosenSubscription
    ) {
      replace(ROUTES.setupSubscription);
      return;
    }

    if (
      session.status === "authenticated" &&
      !session.data?.user.hasPaidSubscription
    ) {
      replace(ROUTES.payment);
      return;
    }
  }, [session]);

  return (
    <AlertsProvider>
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
    </AlertsProvider>
  );
}
