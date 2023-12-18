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
import { Button } from "@/components/ui/button";
import AccountPopoverContent from "./account-popover-content";

export default function MobileAccountPopover() {
  const { data: session, status } = useSession();

  const { currentAccount } = useAppSelector((state) => state.auth);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={status !== "authenticated"}>
        <Button variant="ghost" size="icon">
          {status === "loading" ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar>
              <AvatarImage
                src={
                  currentAccount?.photoUrl
                    ? currentAccount?.photoUrl
                    : session?.user.profilePicture ?? ""
                }
                alt={`@${currentAccount?.username}`}
                className="object-cover"
              />
              <AvatarFallback>
                {currentAccount?.username?.slice(0, 2).toUpperCase() ??
                  session?.user.fullName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <AccountPopoverContent />
    </DropdownMenu>
  );
}
