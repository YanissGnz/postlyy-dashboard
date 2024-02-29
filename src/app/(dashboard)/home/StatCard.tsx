import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGetStatQuery } from "@/redux/api/dashboard/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EAggregation } from "@/types/EAggregation";
import { type EStatType } from "@/types/EStatType";
import CardDropdown from "./card-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/error-card";

export default function StatCard({
  title,
  description,
  unit,
  i,
  handleRemoveCard,
  query,
  aggregation,
  handleChangeAggregation,
}: {
  title: string;
  query: EStatType;
  unit?: string;
  description?: string;
  aggregation: EAggregation;
  i: string;
  handleRemoveCard: (i: string) => () => void;
  handleChangeAggregation: (i: string, aggregation: EAggregation) => () => void;
}) {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { endDate, startDate } = useAppSelector((state) => state.dashboard);

  const aggregationText = useMemo(() => {
    switch (aggregation) {
      case EAggregation.Average:
        return "Average";
      case EAggregation.Sum:
        return "Total of priod";
      case EAggregation.Total:
        return "All time Total";
      default:
        return "All time Total";
    }
  }, [aggregation]);

  const { data, isLoading, isError, refetch } = useGetStatQuery(
    {
      provider: currentAccount!.accountType,
      aggregation: aggregation,
      statType: query,
      startDate,
      endDate,
    },
    {
      skip: !currentAccount,
      refetchOnMountOrArgChange: true,
    },
  );

  if (isLoading) return <Skeleton className="h-full w-full" />;

  if (isError)
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
        <CardTitle className="flex flex-col font-medium">
          <span>{title}</span>
          <span className="text-sm text-muted-foreground">
            {aggregationText}
          </span>
        </CardTitle>
        <CardDropdown
          i={i}
          handleRemoveCard={handleRemoveCard}
          handleChangeAggregation={handleChangeAggregation}
          aggregation={aggregation}
        />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {data?.data.value} {unit}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
