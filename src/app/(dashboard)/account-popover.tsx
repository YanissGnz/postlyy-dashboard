"use client";

import { useSession } from "next-auth/react";
// redux
import { useAppSelector } from "@/redux/hooks";
// components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
// utils
import { cn } from "@/lib/utils";
// types
import AccountPopoverContent from "./account-popover-content";

export default function AccountPopover() {
  const { data: session, status } = useSession();

  const { isCollapsed } = useAppSelector((state) => state.layout);
  const { currentAccount } = useAppSelector((state) => state.auth);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={status !== "authenticated"}>
        <div className="flex w-full cursor-pointer items-center gap-2 rounded border p-2 hover:bg-accent">
          {status === "loading" ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar>
              <AvatarImage
                src={currentAccount?.photoUrl ?? ""}
                alt={`@${currentAccount?.username}`}
              />
              <AvatarFallback>
                {currentAccount?.username?.slice(0, 2).toUpperCase() ??
                  session?.user.fullName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "flex origin-left flex-col gap-1 transition-transform duration-500",
              isCollapsed ? "scale-0" : "scale-100",
            )}
          >
            {status === "loading" ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-semibold">
                {session?.user.fullName}
              </span>
            )}
            {status === "loading" ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              currentAccount?.username &&
              currentAccount?.username?.length > 0 && (
                <span className="text-xs text-accent-foreground/60">
                  @{currentAccount?.username}
                </span>
              )
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <AccountPopoverContent />
    </DropdownMenu>
  );
}
