"use client";

import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Iconify from "../ui/icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";

export default function AccountPopover() {
  const { data: session, status } = useSession();
  const { isCollapsed } = useAppSelector((state) => state.layout);

  const { theme, setTheme } = useTheme();

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={status !== "authenticated"}>
        <div className="flex w-full cursor-pointer items-center gap-2 rounded border p-2 hover:bg-accent">
          {status === "loading" ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar>
              <AvatarImage
                src={session?.user.image ?? ""}
                alt={`@${session?.user.username}`}
              />
              <AvatarFallback>
                {session?.user.name?.slice(0, 2).toUpperCase()}
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
                {session?.user.name}
              </span>
            )}
            {status === "loading" ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <span className="text-xs text-accent-foreground/60">
                @{session?.user.username}
              </span>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Iconify
              icon="solar:user-circle-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Iconify
              icon="solar:bill-list-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Iconify
              icon="solar:settings-bold-duotone"
              fontSize={22}
              className="mr-2 text-foreground/80"
            />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleTheme}>
          <Iconify
            icon={
              theme === "dark"
                ? "solar:moon-stars-bold-duotone"
                : "solar:sun-2-bold-duotone"
            }
            fontSize={22}
            className="mr-2 text-foreground/80"
          />
          Toggle {theme === "dark" ? "Light" : "Dark"} Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <Iconify
            icon="solar:logout-3-bold-duotone"
            fontSize={22}
            className="mr-2 text-foreground/80"
          />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
