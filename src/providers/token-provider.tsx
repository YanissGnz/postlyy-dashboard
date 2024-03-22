"use client";

import { setAccount, setToken } from "@/redux/slices/authSlice";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function TokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session) {
      if (session.status === "loading") return;

      if (session.data?.user) {
        dispatch(setToken(session.data.user.accessToken));
        if (
          session.data.user.accounts.length > 0 &&
          session.data.user.accounts[0]
        ) {
          dispatch(setAccount(session.data.user.accounts[0]));
        }
      }
    }
  }, [session]);

  return <>{children}</>;
}
