import { type Metadata } from "next";
import Modals from "./modals";

export const metadata: Metadata = {
  title: "Templates | Postlyy",
};

interface TemplateLayoutProps {
  children: React.ReactNode;
}

export default function TemplateLayout({ children }: TemplateLayoutProps) {
  return (
    <>
      {children}
      <Modals />
    </>
  );
}
