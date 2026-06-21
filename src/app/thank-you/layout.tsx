"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/client";
import { ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
      !session?.hasChosenSubscription
    ) {
      replace(ROUTES.setupSubscription);
      return;
    }

    if (
      status === "authenticated" &&
      !session?.hasPaidSubscription
    ) {
      replace(ROUTES.payment);
      return;
    }
  }, [session, status]);

  if (!session || status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  return <>{children}</>;
}
