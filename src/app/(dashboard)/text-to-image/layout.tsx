import RoleBasedGuard from "@/guard/RoleBasedGuard";
import TextToImageTourProvider from "@/providers/text-to-image-tour-provider";
import { ETiers } from "@/types/ETiers";
import { type Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Text to image | Postlyy",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedGuard accessibleTiers={[ETiers.Expert, ETiers.Pro]}>
      <TextToImageTourProvider>{children}</TextToImageTourProvider>
    </RoleBasedGuard>
  );
}
