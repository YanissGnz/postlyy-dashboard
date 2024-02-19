"use client";

import { useSession } from "next-auth/react";
// constant
import { LAYOUT } from "@/lib/constants";
// hooks
import { useMediaQuery } from "usehooks-ts";
// components
import Sidebar from "@/app/(dashboard)/(layout)/sidebar";
import { useAppSelector } from "@/redux/hooks";
import Header from "@/app/(dashboard)/(layout)/header";
import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";
import { Spinner } from "@/components/ui/Spinner";
import AlertsProvider from "../../providers/alerts-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const session = useSession();

  if (session.status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center ">
        <Spinner />
      </div>
    );

  if (session.status === "unauthenticated") {
    localStorage.removeItem("token");
    redirect(ROUTES.login);
  }

  if (
    session.status === "authenticated" &&
    !session.data?.user.hasChosenSubscription &&
    !session.data?.user.isTrial &&
    !session.data?.user.hasPaidSubscription
  ) {
    redirect(ROUTES.setupSubscription);
  }

  if (
    session.status === "authenticated" &&
    !session.data?.user.isTrial &&
    !session.data?.user.hasPaidSubscription
  ) {
    redirect(ROUTES.payment);
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
        <AlertsProvider />
      </main>
    </div>
  );
}
