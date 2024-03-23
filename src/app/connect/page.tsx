"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { EProviders } from "@/types/EProviders";
import useMessage from "@rottitime/react-hook-message-event";
import { sentenceCase } from "change-case";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

const LINKEDIN_AUTH_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/linkedin`;
const TWITTER_AUTH_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/twitter`;

export default function index() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const success = searchParams.get("success") === "true";
  const error = searchParams.get("error");
  const provider = Number(searchParams.get("provider")) as EProviders;

  const { push } = useRouter();

  const url = useMemo(() => {
    switch (provider) {
      case EProviders.Linkedin:
        return LINKEDIN_AUTH_URL;
      case EProviders.Twitter:
        return TWITTER_AUTH_URL;
      default:
        return "";
    }
  }, [provider]);

  const { sendToParent } = useMessage("authenticate");

  useEffect(() => {
    if (token) {
      sendToParent({
        type: "authenticate",
        payload: {
          token,
          provider,
        },
      });
      window.close();
    }
  }, [token, sendToParent]);

  useEffect(() => {
    if (!success && !error && provider !== undefined) {
      push(url);
    } else if (error) {
      toast.error(sentenceCase(error));
      window.close();
    }
  }, [success, error, provider]);

  useEffect(() => {
    return () => {
      sendToParent({
        type: "authenticate",
        payload: {
          provider,
          error: "User cancelled",
        },
      });
    };
  }, [sendToParent]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <p className="text-center">
        You will be redirected to{" "}
        {provider === EProviders.Linkedin ? "Linkedin" : "Twitter"} to connect
        your account.
      </p>
      <p className="text-center">
        If it doesn't redirect you, click
        <Link href={url}>
          <Button variant="link">Here</Button>
        </Link>
      </p>
    </div>
  );
}
