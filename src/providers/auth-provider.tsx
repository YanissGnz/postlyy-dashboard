"use client";

import { AuthProvider } from "@/lib/auth/client";

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
