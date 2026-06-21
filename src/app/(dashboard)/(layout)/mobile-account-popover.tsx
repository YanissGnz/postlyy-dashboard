"use client";

import { useAuth } from "@/lib/auth/client";
// redux
import { useAppSelector } from "@/redux/hooks";
// components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import AccountPopoverContent from "./account-popover-content";

export default function MobileAccountPopover() {
  const { data: session, status } = useAuth();

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
                    : session?.profilePicture ?? ""
                }
                alt={`@${currentAccount?.username}`}
                className="object-cover"
              />
              <AvatarFallback>
                {currentAccount?.username?.slice(0, 2).toUpperCase() ??
                  session?.fullName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <AccountPopoverContent />
    </DropdownMenu>
  );
}
