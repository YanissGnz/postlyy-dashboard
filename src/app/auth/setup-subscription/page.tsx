import React from "react";
import SetupForm from "./form";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/routes";

export default async function SetupSubscription() {
  const session = await getServerAuthSession();

  if (session?.user.hasChosenSubscription) {
    redirect(ROUTES.payment);
  }
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
