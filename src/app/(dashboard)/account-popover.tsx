"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
// redux
import { useAppSelector } from "@/redux/hooks";
// components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
// utils
import { cn } from "@/lib/utils";
// types
import { type TAccount } from "@/types/TAccount";
import { useDispatch } from "react-redux";
import { setAccount } from "@/redux/slices/authSlice";
import Link from "next/link";
import { ROUTES } from "@/routes";

export default function AccountPopover() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const dispatch = useDispatch();

  const { isCollapsed } = useAppSelector((state) => state.layout);
  const { currentAccount } = useAppSelector((state) => state.auth);

  const handleToggleTheme = useCallback(
    (newTheme: string) => () => {
      setTheme(newTheme);
    },
    [theme],
  );

  const handleChangeAccount = useCallback(
    (account: TAccount) => () => {
      dispatch(setAccount(account));
    },
    [],
  );

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
              <span className="text-xs text-accent-foreground/60">
                @
                {currentAccount?.username &&
                currentAccount?.username?.length > 0
                  ? currentAccount?.username
                  : "username"}
              </span>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.settings}>
              <Iconify
                icon="solar:settings-bold-duotone"
                fontSize={22}
                className="mr-2 text-foreground/80"
              />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.billing}>
              <Iconify
                icon="solar:bill-list-bold-duotone"
                fontSize={22}
                className="mr-2 text-foreground/80"
              />
              Billing
            </Link>
          </DropdownMenuItem>
          {session?.user.userType === 0 && (
            <DropdownMenuItem asChild>
              <Link href={ROUTES.team}>
                <Iconify
                  icon="solar:users-group-rounded-bold-duotone"
                  fontSize={22}
                  className="mr-2 text-foreground/80"
                />
                Team
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Iconify
                icon="solar:user-circle-bold-duotone"
                fontSize={22}
                className="mr-2 text-foreground/80"
              />
              Accounts
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {session?.user.accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className={cn(
                      "font-medium",
                      currentAccount?.username === account.username &&
                        "bg-primary/20 hover:bg-primary/30",
                    )}
                    onClick={handleChangeAccount(account)}
                  >
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage
                        src={account.photoUrl ?? ""}
                        alt={`@${account.username}`}
                      />
                      <AvatarFallback>
                        {account.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    @{account.username}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.accounts}>
                    <Iconify
                      icon="solar:add-circle-bold-duotone"
                      fontSize={22}
                      className="mr-2 text-foreground/80"
                    />
                    Add account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Iconify
                icon={
                  theme === "dark"
                    ? "solar:moon-stars-bold-duotone"
                    : "solar:sun-2-bold-duotone"
                }
                fontSize={22}
                className="mr-2 text-foreground/80"
              />
              Change theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={handleToggleTheme("dark")}>
                  <Iconify
                    icon="solar:moon-stars-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-foreground/80"
                  />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleTheme("light")}>
                  <Iconify
                    icon="solar:sun-2-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-foreground/80"
                  />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleTheme("system")}>
                  <Iconify
                    icon="solar:settings-minimalistic-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-foreground/80"
                  />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
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
