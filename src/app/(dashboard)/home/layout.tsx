import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { EUserType } from "@/types/EUserType";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleBasedGuard
      accessibleRoles={[
        EUserType.Manager,
        EUserType.Owner,
        EUserType.TeamMember,
      ]}
    >
      {children}
    </RoleBasedGuard>
  );
}
