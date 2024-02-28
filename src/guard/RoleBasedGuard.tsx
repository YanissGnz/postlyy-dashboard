"use client";

import { type ReactNode } from "react";
import forbidden from "public/images/403.png";
import Image from "@/components/ui/image";
import { type EUserType } from "@/types/EUserType";
import { useSession } from "next-auth/react";
import { type ETiers } from "@/types/ETiers";
// ----------------------------------------------------------------------

interface RoleBasedGuardProp {
  accessibleRoles: EUserType[];
  accessibleTiers?: ETiers[];
  children: ReactNode;
}

export default function RoleBasedGuard({
  accessibleRoles,
  accessibleTiers,
  children,
}: RoleBasedGuardProp) {
  const session = useSession();

  if (!session?.data?.user) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Permission Denied</h1>
        <p className="text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image src={forbidden.src} height={400} width={400} />
      </div>
    );
  }

  if (
    session?.data?.user?.userType &&
    (!accessibleRoles.includes(session?.data?.user.userType) ||
      !accessibleTiers?.includes(session?.data?.user.tier))
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
        <h1 className="text-4xl font-bold">Permission Denied</h1>
        <p className="text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image src={forbidden.src} height={400} width={400} />
      </div>
    );
  }

  return <>{children}</>;
}
