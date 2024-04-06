import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetAllMembersQuery } from "@/redux/api/user/team/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { changeDashboardUserIds } from "@/redux/slices/dashboardSlice";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { useCallback, useMemo } from "react";

export default function UserSelect() {
  const { data, isLoading, isSuccess } = useGetAllMembersQuery();
  const dispatch = useAppDispatch();
  const { userIds } = useAppSelector((state) => state.dashboard);

  const members = useMemo(() => {
    return (
      data?.data.map((member) => ({
        id: member.id,
        label: member.fullName,
        subordinates: member.subbordinates,
      })) ?? []
    );
  }, [data]);

  const handleSelect = useCallback(
    (value: string) => {
      const updatedUserIds = userIds.includes(value)
        ? userIds.filter((id) => id !== value)
        : [...userIds, value];
      dispatch(
        changeDashboardUserIds(
          updatedUserIds.filter((id) => members.find((m) => m.id === id)),
        ),
      );
    },
    [dispatch, userIds],
  );

  if (isLoading) return <Skeleton className="h-10 w-36" />;

  if (isSuccess)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "h-fit w-full flex-wrap justify-between",
              userIds && "text-muted-foreground",
            )}
          >
            {userIds?.length ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {userIds
                  .filter((id) => members.find((m) => m.id === id))
                  .map((id) => (
                    <Badge variant="outline">
                      {members?.find((m) => m.id === id)?.label ?? "Unknown"}
                    </Badge>
                  ))}
              </div>
            ) : (
              "Select members..."
            )}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search member..." className="h-9" />
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              {members?.map((member) => (
                <CommandItem
                  value={member.id}
                  key={member.id}
                  onSelect={handleSelect}
                >
                  {member.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      userIds?.includes(member.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );

  return null;
}
