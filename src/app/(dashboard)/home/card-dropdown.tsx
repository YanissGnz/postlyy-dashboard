import { EAggregation } from "@/types/EAggregation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

type Props = {
  i: string;
  handleRemoveCard: (i: string) => () => void;
  handleChangeAggregation?: (
    i: string,
    aggregation: EAggregation,
  ) => () => void;
  aggregation?: EAggregation;
};

export default function CardDropdown({
  handleChangeAggregation,
  handleRemoveCard,
  i,
  aggregation,
}: Props) {
  return (
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
        {handleChangeAggregation && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <>
                <Iconify
                  icon="solar:square-transfer-horizontal-bold-duotone"
                  className="mr-2"
                  fontSize={18}
                />{" "}
                Change Aggregation
              </>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  onClick={handleChangeAggregation(i, EAggregation.Sum)}
                  checked={aggregation === EAggregation.Sum}
                >
                  Sum
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={handleChangeAggregation(i, EAggregation.Average)}
                  checked={aggregation === EAggregation.Average}
                >
                  Average
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onClick={handleChangeAggregation(i, EAggregation.Total)}
                  checked={aggregation === EAggregation.Total}
                >
                  Total
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
