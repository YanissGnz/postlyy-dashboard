"use client";

import { useAppSelector } from "@/redux/hooks";
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

  const currentAccount = useAppSelector((state) => state.auth.currentAccount);

  useEffect(() => {
    if (session) {
      if (session.status === "loading") return;

      if (session.data?.user) {
        dispatch(setToken(session.data.user.accessToken));
        localStorage.setItem("token", session.data.user.accessToken);
        if (
          session.data.user.accounts.length > 0 &&
          session.data.user.accounts[0] &&
          !currentAccount
        ) {
          dispatch(setAccount(session.data.user.accounts[0]));
        }

        if (!session.data.user.hasChosenSubscription) {
          push(ROUTES.setupSubscription);
        }

        if (!session.data?.user.hasPaidSubscription) {
          push(ROUTES.payment);
        }
      }
    }
  }, [session, currentAccount]);

  return <>{children}</>;
}
