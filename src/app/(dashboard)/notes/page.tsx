import Link from "next/link";
import { DataTable } from "./data-table";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";

export default function BlogsPage() {
  return (
    <div className="flex h-screen flex-col space-y-2 px-4 py-4 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notes</h2>
        <Link href={ROUTES.notes.create}>
          <Button>Create Note</Button>
        </Link>
      </div>
      <div>
        <DataTable />
      </div>
    </div>
  );
}
