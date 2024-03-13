import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { ETiers } from "@/types/ETiers";
import { type Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Inspiration | Postlyy",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedGuard accessibleTiers={[ETiers.Expert]}>
      <div className="flex h-screen flex-col space-y-2 px-4 py-4 md:px-8">
        <h2 className="mb-5 text-2xl font-bold tracking-tight">Inspiration</h2>
        <div className="flex-1">{children}</div>
      </div>
    </RoleBasedGuard>
  );
}
