import { useAuth } from "@/lib/auth/client";
import { useCallback } from "react";
import { Button } from "./ui/button";
import Iconify from "./ui/icon";

export default function SignOutButton() {
  const { signOut } = useAuth();
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return (
    <Button variant="secondary" onClick={handleSignOut}>
      <Iconify icon="solar:logout-2-bold-duotone" className="mr-2" />
      Logout
    </Button>
  );
}
