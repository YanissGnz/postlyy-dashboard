"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { EProviders } from "@/types/EProviders";
import useMessage from "@rottitime/react-hook-message-event";
import { sentenceCase } from "change-case";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const LINKEDIN_AUTH_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/linkedin`;
const TWITTER_AUTH_URL = `${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/twitter`;

export default function index() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const success = searchParams?.get("success") === "true";
  const error = searchParams?.get("error");
  const provider = Number(searchParams?.get("provider")) as EProviders;
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    void (async () => {
      await crypto.subtle
        .digest(
          "SHA-256",
          new TextEncoder().encode(env.NEXT_PUBLIC_AUTH_SECRET_KEY),
        )
        .then((hash) => {
          const hashArray = Array.from(new Uint8Array(hash));
          return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        })
        .then((hash) => {
          setHash(hash);
        });
    })();
  }, []);

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
        },
      });
      window.close();
    } else if (error) {
      sendToParent({
        type: "authenticate",
        payload: {
          error,
        },
      });
      window.close();
    }
  }, [token, sendToParent, error]);

  useEffect(() => {
    if (!success && !error && provider !== undefined && hash) {
      push(`${url}?hash=${hash}`);
    }
  }, [success, error, hash, url, provider]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      {success ? (
        <p className="text-center">
          You will be redirected to the app in a few seconds.
        </p>
      ) : error ? (
        <p className="text-center">An error occurred: {sentenceCase(error)}</p>
      ) : (
        <p className="text-center">
          You will be redirected to{" "}
          {provider === EProviders.Linkedin
            ? "Linkedin"
            : provider === EProviders.Twitter
              ? "Twitter"
              : ""}{" "}
          to connect your account.
        </p>
      )}
      {hash === "" ? (
        <p>Loading...</p>
      ) : (
        <p className="text-center">
          If it doesn't redirect you, click
          <Link href={`${url}?hash=${hash}`}>
            <Button variant="link">Here</Button>
          </Link>
        </p>
      )}
    </div>
  );
}
