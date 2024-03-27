"use client";

import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/routes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SetupForm from "./form";

export default function SetupSubscription() {
  const session = useSession();
  const { replace } = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      replace(ROUTES.login);
      return;
    }

    if (
      session.status === "authenticated" &&
      session.data?.user.hasChosenSubscription &&
      session.data?.user.hasPaidSubscription
    ) {
      replace(ROUTES.home);
      return;
    }

    if (
      session.status === "authenticated" &&
      session.data?.user.hasChosenSubscription &&
      !session.data?.user.hasPaidSubscription
    ) {
      replace(ROUTES.payment);
      return;
    }
  }, [session]);

  if (session.status === "loading")
    return (
      <div className="h-screen w-screen">
        <Spinner />
      </div>
    );

  return (
    <div className="flex w-screen flex-col gap-10 p-10">
      <div className="flex w-full flex-col items-center justify-center ">
        <h1 className="text-center text-2xl font-bold md:text-4xl">
          Let's finish powering you up!
        </h1>
      </div>
      <SetupForm />
    </div>
  );
}
