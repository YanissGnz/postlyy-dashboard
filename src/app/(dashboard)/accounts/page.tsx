"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import React, { useCallback } from "react";
import { signIn } from "next-auth/react";

export default function AccountsPage() {
  const { user } = useAppSelector((state) => state.auth);

  const isConnected = useCallback(
    (accountType: number) => {
      return Boolean(
        user?.accounts.find((account) => account.accountType === accountType),
      );
    },
    [user],
  );
  const getAccountByType = useCallback(
    (accountType: number) => {
      return user?.accounts.find(
        (account) => account.accountType === accountType,
      );
    },
    [user],
  );

  const connect = useCallback(
    (method: string) => async () => {
      await signIn(method, { callbackUrl: "/accounts" }).then((res) => {
        console.log(res);
      });
    },
    [],
  );

  return (
    <Card className="grid grid-cols-1 gap-5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/providers/twitter-logo.png"
            alt="logo"
            width="50"
            height="50"
          />
          <p className="font-medium">Twitter</p>
        </div>
        <p>
          {isConnected(0) ? getAccountByType(0)?.username : "Not connected"}
        </p>
        <Button variant="outline" onClick={connect("twitter")}>
          Connect
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/providers/linkedin-logo.png"
            alt="logo"
            width="50"
            height="50"
          />
          <p className="font-medium">LinkedIn</p>
        </div>
        <p>
          {isConnected(1) ? getAccountByType(1)?.username : "Not connected"}
        </p>
        <Button variant="outline">Connect</Button>
      </div>
    </Card>
  );
}
