import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import CardDropdown from "./card-dropdown";
import { DataTable } from "./posts-stats-data-table";

export default function PostsStatsCard({
  i,
  handleRemoveCard,
}: {
  i: string;
  handleRemoveCard: (i: string) => () => void;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex flex-col font-medium">
          Best Posts Stats
        </CardTitle>
        <CardDropdown i={i} handleRemoveCard={handleRemoveCard} />
      </CardHeader>
      <DataTable />
    </Card>
  );
}
