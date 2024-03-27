import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Post History | Postlyy",
};

interface HistoryLayoutProps {
  children: React.ReactNode;
}

export default function HistoryLayout({ children }: HistoryLayoutProps) {
  return (
    <>
      {children}
      <Modals />
    </>
  );
}
