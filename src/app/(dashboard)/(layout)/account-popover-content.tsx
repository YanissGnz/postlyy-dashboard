"use client";

import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
// redux
import { useAppSelector } from "@/redux/hooks";
// components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
// utils
import { cn } from "@/lib/utils";
// types
import { useGetAccountsQuery } from "@/redux/api/user/account/apiSlice";
import { setAccount } from "@/redux/slices/authSlice";
import { ROUTES } from "@/routes";
import { EUserType } from "@/types/EUserType";
import { type TAccount } from "@/types/TAccount";
import Link from "next/link";
import { useDispatch } from "react-redux";

export default function AccountPopoverContent() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { data: accounts, isLoading, isSuccess } = useGetAccountsQuery();

  const dispatch = useDispatch();

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
        {session?.user && [EUserType.Owner].includes(session.user.userType) && (
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
        )}
      </DropdownMenuGroup>
      <DropdownMenuItem asChild>
        <Link href={ROUTES.support}>
          <Iconify
            icon="solar:chat-dots-bold-duotone"
            fontSize={22}
            className="mr-2 text-foreground/80"
          />
          Support
        </Link>
      </DropdownMenuItem>
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
              {isLoading ? (
                <DropdownMenuItem disabled>
                  <Skeleton className="h-4 w-28" />
                </DropdownMenuItem>
              ) : (
                isSuccess &&
                accounts.data.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className={cn(
                      "font-medium",
                      currentAccount?.accountType === account.accountType &&
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
                ))
              )}
              <DropdownMenuItem asChild>
                <Link href={ROUTES.accounts.root}>
                  <Iconify
                    icon="solar:refresh-circle-bold-duotone"
                    fontSize={22}
                    className="mr-2 text-foreground/80"
                  />
                  Manage accounts
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
  );
}
