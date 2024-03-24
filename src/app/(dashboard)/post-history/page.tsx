import { DataTable } from "./data-table";

export default function NotesPage() {
  return (
    <div className="flex h-screen flex-col space-y-2 px-4 py-4 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">History</h2>
      </div>
      <div>
        <DataTable />
      </div>
    </div>
  );
}
