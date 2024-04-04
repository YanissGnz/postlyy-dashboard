"use client";

import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";
import { ETiers } from "@/types/ETiers";
import { EUserType } from "@/types/EUserType";
import { useSession } from "next-auth/react";
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
  const session = useSession();

  const hasAccount = useMemo(() => {
    return session.data?.user?.accounts?.length
      ? session.data?.user?.accounts?.length > 0
      : false;
  }, [session]);

  if (!session || session.status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  if (!session?.data?.user) {
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
      <div className="relative">
        <div className="absolute z-10 flex h-screen w-full flex-col items-center justify-center gap-4 bg-background/50 p-10">
          <h1 className="text-4xl font-bold">
            You do not have any account associated with your profile
          </h1>
          <p className="text-lg">
            {" "}
            Please connect an account to access this page.
          </p>
          <Link href={ROUTES.accounts.root}>
            <Button variant="link">Connect Account</Button>
          </Link>
        </div>
        <div className="opacity-80">{children}</div>
      </div>
    );
  }

  if (
    Boolean(session?.data?.user) &&
    (!accessibleRoles?.includes(session?.data?.user.userType) ||
      !accessibleTiers?.includes(session?.data?.user.tier))
  ) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-10">
        <h1 className="text-4xl font-bold">Permission Denied</h1>
        <p className="text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image alt="Forbidden" src={forbidden.src} height={400} width={400} />
      </div>
    );
  }
  return <>{children}</>;
}
