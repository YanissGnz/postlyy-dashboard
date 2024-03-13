import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { ETiers } from "@/types/ETiers";
import React from "react";

export const metadata: Metadata = {
  title: "Text to image | Postlyy",
};


export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedGuard accessibleTiers={[ETiers.Expert, ETiers.Pro]}>
      {children};
    </RoleBasedGuard>
  );
}
