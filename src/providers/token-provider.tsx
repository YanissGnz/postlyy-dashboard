"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/client";
import { getUTCOffset } from "@/lib/utils";
import { useSetOffsetMutation } from "@/redux/api/user/dashboard/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { setAccount, setToken } from "@/redux/slices/authSlice";
import { ROUTES } from "@/routes";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function TokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useAuth();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const pathname = usePathname();

  const currentAccount = useAppSelector((state) => state.auth.currentAccount);

  const [setOffset] = useSetOffsetMutation();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      dispatch(setToken(session.accessToken));
      localStorage.setItem("token", session.accessToken);
      const offset = getUTCOffset();
      void setOffset({ offset });
      if (session.accounts.length > 0 && session.accounts[0] && !currentAccount) {
        dispatch(setAccount(session.accounts[0]));
      }

      if (pathname?.split("/")[1] === "auth") {
        push(ROUTES.home);
      }
    } else if (
      ![
        ROUTES.register,
        ROUTES.login,
        ROUTES.recoverPassword,
        ROUTES.confirmEmail,
      ].includes(pathname ?? "")
    ) {
      push(ROUTES.login);
    }
  }, [status, session, currentAccount]);

  if (status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  return <>{children}</>;
}
