import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Notes | Postlyy",
};

interface CalendarLayoutProps {
  children: React.ReactNode;
}

export default function CalendarLayout({ children }: CalendarLayoutProps) {
  return (
    <>
      {children}
      <Modals />
    </>
  );
}
