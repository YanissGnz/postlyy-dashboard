/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
// components
import { Skeleton } from "@/components/ui/skeleton";
import {
  accountApiUtil,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from "@/redux/api/user/account/apiSlice";
import { ROUTES } from "@/routes";
import { EProviders } from "@/types/EProviders";
import { type TNewAccount } from "@/types/TNewAccount";
import useMessage from "@rottitime/react-hook-message-event";
import { sentenceCase } from "change-case";
import { decode, type JwtPayload } from "jsonwebtoken";
import { useBoolean } from "usehooks-ts";

export default function AccountsPage() {
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isFetching: isAccountsFetching,
    refetch,
  } = useGetAccountsQuery();
  const [deleteAccount, { isLoading: isDeleteLoading }] =
    useDeleteAccountMutation();

  const {
    value: isLoading,
    setTrue: startLoading,
    setFalse: stopLoading,
  } = useBoolean(false);

  useMessage("authenticate", async (send, payload) => {
    const { token, error } = payload as {
      token?: string;
      error?: string;
    };

    if (error) {
      toast.error(sentenceCase(error));
      return;
    } else if (token) {
      startLoading();
      const decoded = decode(token) as (JwtPayload & { data: string }) | null;

      if (!decoded) {
        toast.error("Invalid token");
        return;
      }

      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        toast.error("Token expired");
        return;
      }

      const { data } = decoded;

      const decodedData = JSON.parse(
        Buffer.from(data, "base64").toString("utf-8"),
      ) as TNewAccount;

      await fetch(`/api/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(decodedData),
      })
        .then(async (res) => {
          if (res.ok) {
            toast.success("Account connected successfully");
            accountApiUtil.invalidateTags(["Accounts"]);
            void refetch();
          } else {
            const error = (await res.json()) as { message: string } | string[];

            if (Array.isArray(error)) {
              toast.error(error.join(", "));
            } else {
              toast.error(error.message);
            }
          }
        })
        .catch((e) => {
          const message =
            e instanceof Error ? e.message : "Something went wrong";
          toast.error(message);
        });
    }
    stopLoading();
  });

  const isConnected = useCallback(
    (accountType: EProviders) => {
      if (!accounts) return false;
      return Boolean(
        accounts.data.find((account) => account.accountType === accountType),
      );
    },
    [accounts],
  );

  const getAccountByType = useCallback(
    (accountType: EProviders) => {
      if (!accounts) return null;
      return accounts.data.find(
        (account) => account.accountType === accountType,
      );
    },
    [accounts, isAccountsLoading, isAccountsFetching],
  );

  const handleConnect = useCallback(
    (accountType: EProviders) => () => {
      const width = 600;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      const features = `width=${width},height=${height},top=${top},left=${left},popup=yes`;
      const popup = window.open(
        ROUTES.accounts.connect(accountType),
        "_blank",
        features,
      );

      if (!popup) {
        toast.error("Popup blocked");
        return;
      }

      popup.focus();
    },
    [screen],
  );

  const handleDeleteAccount = useCallback(
    (accountType: number) => () => {
      deleteAccount(getAccountByType(accountType)?.id ?? "")
        .unwrap()
        .then(() => {
          toast.success("Account deleted successfully");
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    },
    [accounts, isAccountsLoading, isAccountsFetching],
  );

  if (isAccountsLoading || isAccountsFetching)
    return (
      <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2">
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
}
