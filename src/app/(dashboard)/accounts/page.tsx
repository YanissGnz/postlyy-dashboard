/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import Image from "next/image";
import { useCallback } from "react";
import { toast } from "sonner";
// components
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  accountApiUtil,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from "@/redux/api/user/account/apiSlice";
import { ROUTES } from "@/routes";
import { EProviders } from "@/types/EProviders";
import { type TNewAccount } from "@/types/TNewAccount";
import useMessage from "@rottitime/react-hook-message-event";
import { decode, type JwtPayload } from "jsonwebtoken";

export default function AccountsPage() {
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isFetching: isAccountsFetching,
  } = useGetAccountsQuery();
  const [deleteAccount, { isLoading: isDeleteLoading }] =
    useDeleteAccountMutation();

  useMessage("authenticate", async (send, payload) => {
    const { token } = payload as {
      token: string;
    };

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
        const message = e instanceof Error ? e.message : "Something went wrong";

        toast.error(message);
      });
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
      const features = `width=${width},height=${height},top=${top},left=${left}`;
      if (accountType === EProviders.Linkedin) {
        window.open(ROUTES.accounts.connect_linkedin, "_blank", features);
      } else {
        window.open(ROUTES.accounts.connect_twitter, "_blank", features);
      }
    },
    [],
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
      <Card className="flex h-56 w-full items-center justify-center ">
        <Spinner />
      </Card>
    );
  return (
    <Card className="grid grid-cols-1 gap-5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/providers/x-logo.png"
            alt="logo"
            width="50"
            height="50"
            className="rounded-full"
          />
          <p className="font-medium">X (Twitter)</p>
        </div>
        <p>
          {isConnected(EProviders.Twitter)
            ? `@${getAccountByType(EProviders.Twitter)?.username}`
            : "Not connected"}
        </p>
        {isConnected(EProviders.Twitter) ? (
          <Button
            variant="destructive"
            onClick={handleDeleteAccount(EProviders.Twitter)}
            disabled={isDeleteLoading}
            loading={isDeleteLoading}
          >
            Delete
          </Button>
        ) : (
          <Button variant="outline" onClick={handleConnect(EProviders.Twitter)}>
            Connect
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/providers/linkedin-logo.png"
            alt="logo"
            width="50"
            height="50"
            className="rounded-full"
          />
          <p className="font-medium">LinkedIn</p>
        </div>
        <p>
          {isConnected(1)
            ? `@${getAccountByType(1)?.username}`
            : "Not connected"}
        </p>
        {isConnected(EProviders.Linkedin) ? (
          <Button
            variant="destructive"
            onClick={handleDeleteAccount(EProviders.Linkedin)}
            disabled={isDeleteLoading}
            loading={isDeleteLoading}
          >
            Delete
          </Button>
        ) : getAccountByType(EProviders.Linkedin)?.isExpired ? (
          <Button
            variant="outline"
            onClick={handleConnect(EProviders.Linkedin)}
          >
            Renew
          </Button>
        ) : (
          <Button
            onClick={handleConnect(EProviders.Linkedin)}
            variant="outline"
          >
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}
