"use client";

import React, { useEffect } from "react";
import { env } from "@/env";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

export default function Payment() {
  const session = useSession();

  const { push } = useRouter();

  useEffect(() => {
    if (session.data?.user.token)
      fetch(`${env.NEXT_PUBLIC_API_BASEURL}/api/Subscription/link`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.user.token}`,
        },
      })
        .then((res) => res.json())
        .then((data: { data: { link: string } } | string[]) => {
          if (data?.data?.link) push(data.data.link);
          else if (data.includes("SUBSCRIPTION_PAID")) {
            push(ROUTES.home);
          }
        })
        .catch((err: string[]) => {
          if (err.includes("SUBSCRIPTION_PAID")) {
            push(ROUTES.home);
          }
        });
  }, [session.data?.user.token]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1 className="text-center text-xl">
        You will be redirected to the payment page{" "}
      </h1>
    </div>
  );
}
