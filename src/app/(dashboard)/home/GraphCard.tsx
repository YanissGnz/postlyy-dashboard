import ErrorCard from "@/components/error-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactApexChart, { BaseOptionChart } from "@/components/ui/chart";
import Iconify from "@/components/ui/icon";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getProviderIcon } from "@/lib/utils";
import { useGetGraphQuery } from "@/redux/api/dashboard/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EProviders } from "@/types/EProviders";
import { type EStatType } from "@/types/EStatType";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { merge } from "lodash";
import { useMemo } from "react";
import CardDropdown from "./card-dropdown";

export default function GraphCard({
  title,
  description,
  i,
  handleRemoveCard,
  query,
  provider,
}: {
  title: string;
  query: EStatType;
  description?: string;
  i: string;
  handleRemoveCard: (i: string) => () => void;
  provider: EProviders;
}) {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { endDate, startDate, userIds } = useAppSelector(
    (state) => state.dashboard,
  );

  const { data, isLoading, isError, refetch } = useGetGraphQuery(
    {
      provider: provider ?? currentAccount?.accountType ?? EProviders.Twitter,
      statType: query,
      startDate,
      endDate,
      userIds: userIds.length > 0 ? userIds : undefined,
    },
    { refetchOnMountOrArgChange: true },
  );

  const baseOptions = BaseOptionChart();

  const chartOptions = useMemo(() => {
    return merge(baseOptions, {
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
  }, [data]);

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
        <CardTitle className="flex flex-col gap-1 font-medium">
          <div className="flex items-center gap-2">
            <Iconify icon={getProviderIcon(provider)} fontSize={18} />
            <span>{title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardTitle>
        <CardDropdown i={i} handleRemoveCard={handleRemoveCard} />
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
        </CardContent>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
}
