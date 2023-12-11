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
    if (session.status === "authenticated") {
      dispatch(setToken(session.data.user.token));
      localStorage.setItem("token", session.data.user.token);
      if (
        session.data.user.accounts.length > 0 &&
        session.data.user.accounts[0]
      ) {
        dispatch(setAccount(session.data.user.accounts[0]));
      }
    } else if (session.status === "unauthenticated") {
      localStorage.removeItem("token");
    }
  }, [session]);

  return <>{children}</>;
}
