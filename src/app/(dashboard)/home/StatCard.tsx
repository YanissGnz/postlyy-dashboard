import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

import ErrorCard from "@/components/error-card";
import Iconify from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviderIcon } from "@/lib/utils";
import { useGetStatQuery } from "@/redux/api/dashboard/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EAggregation } from "@/types/EAggregation";
import { EProviders } from "@/types/EProviders";
import { type EStatType } from "@/types/EStatType";
import CardDropdown from "./card-dropdown";

export default function StatCard({
  title,
  description,
  unit,
  i,
  handleRemoveCard,
  query,
  aggregation,
  handleChangeAggregation,
  provider,
}: {
  title: string;
  query: EStatType;
  unit?: string;
  description?: string;
  aggregation: EAggregation;
  i: string;
  handleRemoveCard: (i: string) => () => void;
  handleChangeAggregation: (i: string, aggregation: EAggregation) => () => void;
  provider: EProviders;
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
      provider: provider ?? currentAccount?.accountType ?? EProviders.Twitter,
      aggregation: aggregation,
      statType: query,
      startDate,
      endDate,
    },
    { refetchOnMountOrArgChange: true },
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

      <CardContent>
        <div className="text-2xl font-bold">
          {Math.round(data?.data.value)} {unit}
        </div>
      </CardContent>
    </Card>
  );
}
