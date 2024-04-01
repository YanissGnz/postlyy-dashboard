import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

import ErrorCard from "@/components/error-card";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviderIcon } from "@/lib/utils";
import { useGetStatQuery } from "@/redux/api/dashboard/apiSlice";
import { useGetAllMembersQuery } from "@/redux/api/user/team/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EAggregation } from "@/types/EAggregation";
import { EProviders } from "@/types/EProviders";
import { type EStatType } from "@/types/EStatType";
import { capitalCase } from "change-case";
import CardDropdown from "./card-dropdown";

export default function StatCard({
  title,
  description,
  i,
  handleRemoveCard,
  query,
  aggregation,
  handleChangeAggregation,
  provider,
}: {
  title: string;
  query: EStatType;
  description?: string;
  aggregation: EAggregation;
  i: string;
  handleRemoveCard: (i: string) => () => void;
  handleChangeAggregation: (i: string, aggregation: EAggregation) => () => void;
  provider: EProviders;
}) {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { endDate, startDate, userIds } = useAppSelector(
    (state) => state.dashboard,
  );

  const aggregationText = useMemo(() => {
    switch (aggregation) {
      case EAggregation.Average:
        return "Average";
      case EAggregation.Sum:
        return "Total of period";
      case EAggregation.Total:
        return "All time Total";
      default:
        return "All time Total";
    }
  }, [aggregation]);

  const { data, isLoading, isError, refetch } = useGetStatQuery(
    {
      provider: provider ?? currentAccount?.accountType ?? EProviders.Twitter,
      aggregation: aggregation,
      statType: query,
      startDate,
      endDate,
      userIds: userIds.length > 0 ? userIds : undefined,
    },
    { refetchOnMountOrArgChange: true },
  );

  const {
    data: membersData,
    isLoading: membersIsLoading,
    isError: membersIsError,
  } = useGetAllMembersQuery();

  const getMemberFullName = (userId: string) => {
    const member = membersData?.data.find((m) => m.id === userId);
    return member?.fullName ?? userId;
  };

  if (isLoading || membersIsLoading)
    return <Skeleton className="h-full w-full" />;

  if (isError || membersIsError)
    return (
      <ErrorCard
        refetchFunction={refetch}
        title={`Failed to load ${title} data.`}
        titleClassName="text-sm"
        className="h-full"
      />
    );

  return (
    <Card className="flex h-full flex-col items-start justify-between">
      <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex flex-col gap-1 font-medium">
          <div className="flex items-center gap-2">
            <Iconify icon={getProviderIcon(provider)} fontSize={18} />
            <span>{title}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {aggregationText}
          </span>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardTitle>
        <CardDropdown
          i={i}
          handleRemoveCard={handleRemoveCard}
          handleChangeAggregation={handleChangeAggregation}
          aggregation={aggregation}
        />
      </CardHeader>

      <ScrollArea className="max-h-full w-full px-4">
        <div className="mb-4 flex h-full flex-col justify-end">
          {data?.data?.map((stat) => (
            <p key={stat.userId}>
              {capitalCase(getMemberFullName(stat.userId))}:{" "}
              <span className="font-bold">
                {Math.round(stat.value * 100) / 100}
              </span>
            </p>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
