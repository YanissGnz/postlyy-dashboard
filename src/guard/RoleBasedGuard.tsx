"use client";

import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/client";
import { ROUTES } from "@/routes";
import { ETiers } from "@/types/ETiers";
import { EUserType } from "@/types/EUserType";
import Image from "next/image";
import Link from "next/link";
import forbidden from "public/images/403.png";
import { useMemo, type ReactNode } from "react";

interface RoleBasedGuardProp {
  accessibleRoles?: EUserType[];
  accessibleTiers?: ETiers[];
  needAccount?: boolean;
  children: ReactNode;
}

export default function RoleBasedGuard({
  accessibleRoles = [EUserType.Manager, EUserType.Owner, EUserType.TeamMember],
  accessibleTiers = [ETiers.Basic, ETiers.Pro, ETiers.Expert],
  needAccount,
  children,
}: RoleBasedGuardProp) {
  const { data: session, status } = useAuth();

  const hasAccount = useMemo(() => {
    return session?.accounts?.length
      ? session.accounts.length > 0
      : false;
  }, [session]);

  if (!session || status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

   if (!session) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Permission Denied</h1>
        <p className="text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image alt="Forbidden" src={forbidden.src} height={400} width={400} />
      </div>
    );
  }

  if (needAccount && !hasAccount) {
    return (
      <div className="relative w-full">
        <div className="absolute z-[1] flex h-full min-h-screen w-full flex-col items-center justify-center gap-4 bg-background/80 p-10 text-center">
          <h1 className="max-w-xl text-balance text-4xl font-bold">
            Looks like you don't have any account connected yet!
          </h1>
          <p className="text-balance text-lg">
            {" "}
            Please connect an account to access this page.
          </p>
          <Link href={ROUTES.accounts.root}>
            <Button variant="link">Connect Account</Button>
          </Link>
        </div>
        <div className="pointer-events-none opacity-80">{children}</div>
      </div>
    );
  }

   if (
     Boolean(session) &&
     (!accessibleRoles?.includes(session.userType) ||
       !accessibleTiers?.includes(session.tier))
   ) {
    return (
      <div className="fixed z-[1] flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-10 text-center">
        <h1 className="text-balance text-4xl font-bold">Permission Denied</h1>
        <p className="text-balance text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image alt="Forbidden" src={forbidden.src} height={400} width={400} />
      </div>
    );
  }
  return <>{children}</>;
}
