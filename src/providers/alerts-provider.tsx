"use client";

import { useAuth } from "@/lib/auth/client";
import { useEffect } from "react";

import { useBoolean } from "usehooks-ts";
import EmailAlert from "./alerts/email-alert";
import PasswordAlert from "./alerts/password-alert";
import SeatsAlert from "./alerts/seats-alert";

export default function AlertsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { value: emailAlertOpen, setValue: setEmailAlertOpen } =
    useBoolean(false);

  const { value: passwordAlertOpen, setValue: setPasswordAlertOpen } =
    useBoolean(false);

  const { value: seatsAlertOpen, setValue: setSeatsAlertOpen } =
    useBoolean(false);

  const { data: session, status } = useAuth();

  useEffect(() => {
    if (
      status === "authenticated" &&
      !session?.hasSetupEmail
    ) {
      setEmailAlertOpen(true);
    } else if (
      status === "authenticated" &&
      session?.hasToChangePassword
    ) {
      setPasswordAlertOpen(true);
    } else if (
      status === "authenticated" &&
      !session?.hasSetupUsers
    ) {
      setSeatsAlertOpen(true);
    }
  }, [session, status]);

  return (
    <>
      <EmailAlert isOpened={emailAlertOpen} setIsOpened={setEmailAlertOpen} />
      <PasswordAlert
        isOpened={passwordAlertOpen}
        setIsOpened={setPasswordAlertOpen}
      />
      <SeatsAlert isOpened={seatsAlertOpen} setIsOpened={setSeatsAlertOpen} />
      {children}
    </>
  );
}
