import RoleBasedGuard from "@/guard/RoleBasedGuard";
import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Post | Postlyy",
};

interface CalendarLayoutProps {
  children: React.ReactNode;
}

export default function CalendarLayout({ children }: CalendarLayoutProps) {
  return (
    <RoleBasedGuard needAccount>
      <div className="flex h-screen flex-col space-y-2 px-4 py-4 md:px-8">
        <h2 className="mb-5 text-2xl font-bold tracking-tight">Post</h2>
        <div className="flex-1">
          {children}
          <Modals />
        </div>
      </div>
    </RoleBasedGuard>
  );
}
