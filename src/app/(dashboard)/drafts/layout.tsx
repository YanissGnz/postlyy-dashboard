import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Drafts | Postlyy",
};

interface CalendarLayoutProps {
  children: React.ReactNode;
}

export default function CalendarLayout({ children }: CalendarLayoutProps) {
  return (
    <RoleBasedGuard needAccount>
      {children}
      <Modals />
    </RoleBasedGuard>
  );
}
