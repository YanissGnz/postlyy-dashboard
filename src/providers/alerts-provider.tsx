import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import { useBoolean } from "usehooks-ts";
import EmailAlert from "./alerts/email-alert";
import PasswordAlert from "./alerts/password-alert";
import SeatsAlert from "./alerts/seats-alert";

export default function AlertsProvider() {
  const { value: emailAlertOpen, setValue: setEmailAlertOpen } =
    useBoolean(false);

  const { value: passwordAlertOpen, setValue: setPasswordAlertOpen } =
    useBoolean(false);

  const { value: seatsAlertOpen, setValue: setSeatsAlertOpen } =
    useBoolean(false);

  const session = useSession();

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      !session.data?.user.hasSetupEmail
    ) {
      setEmailAlertOpen(true);
    } else if (
      session.status === "authenticated" &&
      session.data?.user.hasToChangePassword
    ) {
      setPasswordAlertOpen(true);
    } else if (
      session.status === "authenticated" &&
      !session.data?.user.hasSetupUsers
    ) {
      setSeatsAlertOpen(true);
    }
  }, [session]);

  return (
    <>
      <EmailAlert isOpened={emailAlertOpen} setIsOpened={setEmailAlertOpen} />
      <PasswordAlert
        isOpened={passwordAlertOpen}
        setIsOpened={setPasswordAlertOpen}
      />
      <SeatsAlert isOpened={seatsAlertOpen} setIsOpened={setSeatsAlertOpen} />
    </>
  );
}
