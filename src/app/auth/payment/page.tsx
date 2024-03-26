"use client";

import { env } from "@/env";
import { ROUTES } from "@/routes";
import { isArray } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Payment() {
  const session = useSession();
  const { replace } = useRouter();

  useEffect(() => {
    if (!session?.data?.user.hasChosenSubscription) {
      replace(ROUTES.setupSubscription);
    } else if (session?.data?.user.hasPaidSubscription) {
      replace(ROUTES.home);
    }

    void fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/Subscription/link`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data?.user.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data: { data: { link: string } } | string[]) => {
        if (data && isArray(data)) {
          replace(ROUTES.login);
          return;
        }
        replace(data.data.link);
        return;
      })
      .catch(() => {
        replace(ROUTES.login);
      });
  }, [session]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1 className="text-center text-xl">
        You will be redirected to the payment page{" "}
      </h1>
    </div>
  );
}
