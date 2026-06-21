"use client";

import Header from "@/app/(dashboard)/(layout)/header";
import Sidebar from "@/app/(dashboard)/(layout)/sidebar";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/client";
import { LAYOUT } from "@/lib/constants";
import AppTourProvider from "@/providers/app-tour-provider";
import { useAppSelector } from "@/redux/hooks";
import { ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import AlertsProvider from "../../providers/alerts-provider";
import NotificationsSheet from "./notifications-sheet";
import SupportButton from "./support-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const { data: session, status } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      replace(ROUTES.login);
      localStorage.removeItem("token");
      return;
    }

    if (
      status === "authenticated" &&
      session &&
      !session.hasChosenSubscription
    ) {
      replace(ROUTES.setupSubscription);
      return;
    }

    if (
      status === "authenticated" &&
      session &&
      !session.hasPaidSubscription
    ) {
      replace(ROUTES.payment);
      return;
    }
  }, [status, session]);

  if (status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <AlertsProvider>
      <AppTourProvider>
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
        <SupportButton />
        <NotificationsSheet />
      </AppTourProvider>
    </AlertsProvider>
  );
}
