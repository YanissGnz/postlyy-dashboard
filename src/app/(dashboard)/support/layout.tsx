import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { EUserType } from "@/types/EUserType";
import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Support | Postlyy",
};

interface SupportLayoutProps {
  children: React.ReactNode;
}

export default function SupportLayout({ children }: SupportLayoutProps) {
  return (
    <RoleBasedGuard accessibleRoles={[EUserType.Manager, EUserType.Owner]}>
      <div className="space-y-2 px-4 py-4 md:px-8">
        <div className="space-y-0.5">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Support</h2>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <Modals />
    </RoleBasedGuard>
  );
}
