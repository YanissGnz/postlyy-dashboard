import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { ETiers } from "@/types/ETiers";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedGuard accessibleTiers={[ETiers.Expert, ETiers.Pro]}>
      {children};
    </RoleBasedGuard>
  );
}
