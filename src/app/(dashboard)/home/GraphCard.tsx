import React, { useMemo } from "react";
import ReactApexChart, { BaseOptionChart } from "@/components/ui/chart";
import { merge } from "lodash";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type EStatType } from "@/types/EStatType";
import { useAppSelector } from "@/redux/hooks";
import { EAggregation } from "@/types/EAggregation";
import { useGetGraphQuery } from "@/redux/api/dashboard/apiSlice";
import CardDropdown from "./card-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/error-card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";

export default function GraphCard({
  title,
  description,
  i,
  handleRemoveCard,
  query,
  aggregation,
  handleChangeAggregation,
}: {
  title: string;
  query: EStatType;
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

  const { data, isLoading, isError, refetch } = useGetGraphQuery(
    {
      provider: currentAccount!.accountType,
      aggregation: aggregation,
      statType: query,
      startDate,
      endDate,
    },
    {
      skip: !currentAccount,
    },
  );

  const chartOptions = useMemo(() => {
    return merge(BaseOptionChart(), {
      labels: data?.data.category ?? [],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y: number) => {
            if (typeof y !== "undefined") {
              return `${y.toFixed(0)}`;
            }
            return y;
          },
        },
      },
    });
  }, []);

  if (isLoading) return <Skeleton className="h-full w-full " />;

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
    <Card className="flex h-full flex-col">
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
      <ScrollArea className="h-full w-full flex-1">
        <CardContent className="h-full w-full min-w-[300px] p-1">
          <ReactApexChart
            type="line"
            series={data?.data.series ?? []}
            options={chartOptions}
            height="100%"
            width="100%"
          />
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
