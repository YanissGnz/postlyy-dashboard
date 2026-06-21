"use client";

import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { useCallback } from "react";

export interface MockProvider {
  name: string;
  label: string;
  signInUrl: string;
  id: string;
  type: "oauth" | "credentials";
}

const getProviderIcon = (name: string) => {
  switch (name) {
    case "Twitter":
      return "simple-icons:x";
    case "LinkedIn":
      return "simple-icons:linkedin";
    default:
      return "mdi:account";
  }
};

export default function ProviderLoginButton({ provider }: { provider: MockProvider }) {
  const handleSignIn = useCallback(async () => {
    // For mock auth, we redirect to the login flow for the provider
    // In a real app, this would initiate OAuth flow
    window.location.href = `/auth/oauth?provider=${provider.id}`;
  }, [provider.id]);

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <Iconify icon={getProviderIcon(provider.name)} className="mr-2 h-5 w-5" />
      Login with {provider.name}
    </Button>
  );
}
