"use client";

import { setUser } from "@/redux/slices/authSlice";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session.status === "authenticated") {
      dispatch(setUser(session.data.user));
    }
  }, [session]);

  return <>{children}</>;
}
