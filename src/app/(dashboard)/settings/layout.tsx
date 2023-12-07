import { Separator } from "@/components/ui/separator";
import { type Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Settings | Postlyy",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className="space-y-2 px-4 py-4 md:px-8">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
