"use client";

import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/routes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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

  if (!session || session.status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  return <>{children}</>;
}
