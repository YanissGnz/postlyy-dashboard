import { getServerAuthSession } from "@/server/auth";
import { ETiers } from "@/types/ETiers";
import { EUserType } from "@/types/EUserType";
import Image from "next/image";
import forbidden from "public/images/403.png";
import { type ReactNode } from "react";

interface RoleBasedGuardProp {
  accessibleRoles?: EUserType[];
  accessibleTiers?: ETiers[];
  needAccount?: boolean;
  children: ReactNode;
}

export default async function RoleBasedGuard({
  accessibleRoles = [EUserType.Manager, EUserType.Owner, EUserType.TeamMember],
  accessibleTiers = [ETiers.Basic, ETiers.Pro, ETiers.Expert],
  needAccount,
  children,
}: RoleBasedGuardProp) {
  const session = await getServerAuthSession();

  if (!session?.user) {
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

  if (needAccount && !Boolean(session?.user?.accounts)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
        <h1 className="text-4xl font-bold">Permission Denied</h1>
        <p className="text-lg">
          {" "}
          You do not have permission to access this page
        </p>
        <Image alt="Forbidden" src={forbidden.src} height={400} width={400} />
      </div>
    );
  }

  if (
    Boolean(session?.user) &&
    (!accessibleRoles?.includes(session?.user.userType) ||
      !accessibleTiers?.includes(session?.user.tier))
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
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
