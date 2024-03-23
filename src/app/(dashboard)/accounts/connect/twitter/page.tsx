"use client";

import { env } from "@/env";
import { EProviders } from "@/types/EProviders";
import useMessage from "@rottitime/react-hook-message-event";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const TWITTER_CONNECT_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/twitter`;

export default function index() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const success = searchParams.get("success") === "true";
  const { push } = useRouter();

  const { sendToParent } = useMessage("authenticate");

  useEffect(() => {
    if (token) {
      sendToParent({
        type: "authenticate",
        payload: {
          token,
          provider: EProviders.Twitter,
        },
      });
    }
  }, [token, sendToParent]);

  useEffect(() => {
    if (!success) {
      push(TWITTER_CONNECT_URL);
    }
  }, [success]);

  return <div>You will be redirected to Twitter to connect your account.</div>;
}
