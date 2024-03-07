import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Powerups | Postlyy",
};

interface PowerupsLayoutProps {
  children: React.ReactNode;
}

export default function PowerupsLayout({ children }: PowerupsLayoutProps) {
  return (
    <RoleBasedGuard needAccount>
      <div className="flex h-screen flex-col space-y-2 px-4 py-4 md:px-8">
        <h2 className="mb-5 text-2xl font-bold tracking-tight">Powerups</h2>
        <div className="flex-1">
          {children}
          <Modals />
        </div>
      </div>
    </RoleBasedGuard>
  );
}
