"use client";

import React, { useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { sentenceCase } from "change-case";
import { type JwtPayload, decode } from "jsonwebtoken";
import crypto from "crypto";
// components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/env";
import { ROUTES } from "@/routes";
import {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} from "@/redux/api/user/account/apiSlice";
import { Spinner } from "@/components/ui/Spinner";
import { type TNewAccount } from "@/types/TNewAccount";
import { type TErrorResponse } from "@/types/TErrorResponse";

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

  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const token = searchParams.get("token");

  useEffect(() => {
    if (error) toast.error(sentenceCase(error));
  }, [error]);

  useEffect(() => {
    if (token) {
      const decoded = decode(token) as (JwtPayload & { data: string }) | null;

      if (!decoded) {
        toast.error("Invalid token");
        setTimeout(() => {
          push(ROUTES.accounts);
        }, 1000);
        return;
      }

      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        toast.error("Token expired");
        setTimeout(() => {
          push(ROUTES.accounts);
        }, 1000);
        return;
      }

      const { data } = decoded;

      const decodedData = JSON.parse(
        Buffer.from(data, "base64").toString("utf-8"),
      ) as TNewAccount;
      console.log(
        "🚀 ~ file: page.tsx:70 ~ useEffect ~ decodedData:",
        decodedData,
      );

      addAccount(decodedData)
        .unwrap()
        .then(() => {
          toast.success("Account added successfully");
          setTimeout(() => {
            push(ROUTES.accounts);
          }, 1000);
        })
        .catch((e: TErrorResponse<string[]>) => {
          if (e.data) {
            if (e.data.includes("ACCOUNT_EXISTS")) {
              toast.error("Account already exists");
              push(ROUTES.accounts);
            } else push(ROUTES.accounts);
          } else window.location.reload();
        });
    }
  }, [token]);

  const isConnected = useCallback(
    (accountType: number) => {
      if (!accounts) return false;
      return Boolean(
        accounts.data.find((account) => account.accountType === accountType),
      );
    },
    [accounts],
  );
  const getAccountByType = useCallback(
    (accountType: number) => {
      if (!accounts) return null;
      return accounts.data.find(
        (account) => account.accountType === accountType,
      );
    },
    [accounts, isAccountsLoading, isAccountsFetching],
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
          {isConnected(0)
            ? `@${getAccountByType(0)?.username}`
            : "Not connected"}
        </p>
        {isConnected(0) ? (
          <Button
            variant="destructive"
            onClick={handleDeleteAccount(0)}
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
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={connect("linkedin")}
        >
          Connect
        </Button>
      </div>
    </Card>
  );
}
