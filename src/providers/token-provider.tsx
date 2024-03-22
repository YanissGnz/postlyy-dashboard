"use client";

import { setAccount, setToken } from "@/redux/slices/authSlice";
import { ROUTES } from "@/routes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function TokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const dispatch = useDispatch();
  const { push } = useRouter();

  useEffect(() => {
    if (session.status === "authenticated" && session.data.user.accessToken) {
      dispatch(setToken(session.data.user.accessToken));
      localStorage.setItem("token", session.data.user.accessToken);
      if (
        session.data.user?.accounts?.length > 0 &&
        session.data.user.accounts[0]
      ) {
        dispatch(setAccount(session.data.user.accounts[0]));
      }
    } else if (
      session.status === "unauthenticated" ||
      (!session?.data?.user?.accessToken && session.status === "loading")
    ) {
      localStorage.removeItem("token");
      push(ROUTES.login);
    }
  }, [session]);

  return <>{children}</>;
}
