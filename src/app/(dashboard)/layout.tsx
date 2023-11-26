import Sidebar from "@/components/layout/Sidebar";
import { LAYOUT } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <main
        style={{
          paddingLeft: LAYOUT.MOBILE_SIDEBAR_WIDTH,
        }}
      >
        {children}
      </main>
    </div>
  );
}
