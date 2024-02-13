import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";

export default function StatCard({
  title,
  description,
  unit,
  i,
  handleRemoveCard,
}: {
  title: string;
  query: string;
  unit?: string;
  description?: string;
  i: string;
  handleRemoveCard: (i: string) => () => void;
}) {
  // TODO: Add query to fetch data from the server

  return (
    <Card className="flex h-full flex-col items-start justify-between">
      <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <Iconify icon="eva:more-vertical-fill" className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleRemoveCard(i)}>
              <>
                <Iconify
                  icon="solar:trash-bin-2-bold"
                  className="mr-2 text-destructive"
                  fontSize={18}
                />
                Remove
              </>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">0 {unit}</div>{" "}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
