"use client";

import React, { useCallback } from "react";
import { signIn, type ClientSafeProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";

interface Props {
  provider: ClientSafeProvider;
}

const getProviderIcon = (name: string) => {
  switch (name) {
    case "Twitter":
      return "mdi:twitter";
    case "LinkedIn":
      return "mdi:linkedin";
    default:
      return "mdi:account";
  }
};

export default function ProviderLoginButton({ provider }: Props) {
  const handleSignIn = useCallback(async () => {
    await signIn(provider.id);
  }, [provider.id]);
  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <Iconify icon={getProviderIcon(provider.name)} className="mr-2 h-5 w-5" />
      Login with {provider.name}
    </Button>
  );
}
