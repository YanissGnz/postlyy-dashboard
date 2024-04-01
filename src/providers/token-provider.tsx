"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useAppSelector } from "@/redux/hooks";
import { setAccount, setToken } from "@/redux/slices/authSlice";
import { ROUTES } from "@/routes";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();

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
    }
  }, [session, currentAccount]);

  if (session?.status === "loading")
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner />
      </div>
    );

  return <>{children}</>;
}
