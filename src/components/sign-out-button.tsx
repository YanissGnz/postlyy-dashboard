import { signOut } from "next-auth/react";
import { useCallback } from "react";
import { Button } from "./ui/button";
import Iconify from "./ui/icon";

export default function SignOutButton() {
  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  return (
    <Button variant="secondary" onClick={handleSignOut}>
      <Iconify icon="solar:logout-2-bold-duotone" className="mr-2" />
      Logout
    </Button>
  );
}
