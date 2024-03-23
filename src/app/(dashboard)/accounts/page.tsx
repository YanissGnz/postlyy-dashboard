/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import crypto from "crypto";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
// components
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/env";
import {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from "@/redux/api/user/account/apiSlice";
import { ROUTES } from "@/routes";
import { EProviders } from "@/types/EProviders";
import { type TNewAccount } from "@/types/TNewAccount";
import useMessage from "@rottitime/react-hook-message-event";
import { decode, type JwtPayload } from "jsonwebtoken";
import { isString } from "lodash";

export default function AccountsPage() {
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isFetching: isAccountsFetching,
  } = useGetAccountsQuery();
  const [addAccount, { isLoading }] = useAddAccountMutation();
  const [deleteAccount, { isLoading: isDeleteLoading }] =
    useDeleteAccountMutation();

  const { push } = useRouter();

  useMessage("authenticate", (send, payload) => {
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

    addAccount(decodedData)
      .unwrap()
      .then(() => {
        toast.success("Account added successfully");
      })
      .catch((e: string[]) => {
        if (e && isString(e[0])) {
          toast.error(e[0]);
        }
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
      if (accountType === EProviders.Linkedin) {
        window.open(
          ROUTES.accounts.connect_linkedin,
          "_blank",
          "width=500,height=500,top=50%,left=50%",
        );
      } else {
        window.open(
          ROUTES.accounts.connect_twitter,
          "_blank",
          "width=500,height=500",
        );
      }
    },
    [],
  );

  const connect = useCallback(
    (method: string) => () => {
      const hash = crypto
        .createHmac("sha256", env.NEXT_PUBLIC_AUTH_SECRET_KEY)
        .digest("hex");
      push(`${env.NEXT_PUBLIC_AUTH_BASEURL}/auth/${method}?hash=${hash}`);
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
          <Button
            variant="outline"
            onClick={connect("twitter")}
            disabled={isLoading}
            loading={isLoading}
          >
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
            onClick={connect("linkedin")}
            disabled={isLoading}
            loading={isLoading}
          >
            Renew
          </Button>
        ) : (
          <Button
            onClick={handleConnect(EProviders.Linkedin)}
            variant="outline"
            disabled={isLoading}
            loading={isLoading}
          >
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}
