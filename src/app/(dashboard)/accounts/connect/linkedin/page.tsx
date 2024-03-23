"use client";

import { env } from "@/env";
import { EProviders } from "@/types/EProviders";
import useMessage from "@rottitime/react-hook-message-event";
import { sentenceCase } from "change-case";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const LINKEDIN_AUTH_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/linkedin`;

export default function index() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");
  const { push } = useRouter();

  const { sendToParent } = useMessage("authenticate");

  useEffect(() => {
    if (token) {
      sendToParent({
        type: "authenticate",
        payload: {
          token,
          provider: EProviders.Linkedin,
        },
      });
      window.close();
    }
  }, [token, sendToParent]);

  useEffect(() => {
    if (!success) {
      push(LINKEDIN_AUTH_URL);
    } else if (error) {
      toast.error(sentenceCase(error));
    }
  }, [success, error]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      You will be redirected to Linkedin to connect your account.
    </div>
  );
}
