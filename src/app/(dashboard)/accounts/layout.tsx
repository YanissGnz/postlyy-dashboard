import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts | Postlyy",
};

interface AccountsLayoutProps {
  children: React.ReactNode;
}

export default function AccountsLayout({ children }: AccountsLayoutProps) {
  return (
    <>
      <div className="space-y-2 px-4 py-4 md:px-8">
        <div className="space-y-0.5">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Accounts</h2>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
