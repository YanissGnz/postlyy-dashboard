"use client";

import { env } from "@/env";
import { useAuth } from "@/lib/auth/client";
import { ROUTES } from "@/routes";
import { isArray } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Payment() {
  const { data: session } = useAuth();
  const { replace } = useRouter();

  useEffect(() => {
    if (!session?.hasChosenSubscription) {
      replace(ROUTES.setupSubscription);
    } else if (session?.hasPaidSubscription) {
      replace(ROUTES.home);
    }

    void fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/Subscription/link`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then(async (data: { data: { link: string } } | string[]) => {
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
