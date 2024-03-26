"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  cn,
  getDashboardCardMinHeight,
  getDashboardCardMinWidth,
} from "@/lib/utils";
import {
  useChangeDashboardConfigMutation,
  useGetDashboardConfigQuery,
} from "@/redux/api/user/dashboard/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { changeLayout, removeCard } from "@/redux/slices/dashboardSlice";
import { type EAggregation } from "@/types/EAggregation";
import { EDashboardCardType } from "@/types/EDashboardCardType";
import { type DashboardConfig } from "@/types/TDashboardConfig";
import { max } from "lodash";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo } from "react";
import { type Layout } from "react-grid-layout";
import { useBoolean, useElementSize } from "usehooks-ts";
import CalendarCard from "./CalendarCard";
import GraphCard from "./GraphCard";
import PostsStatsCard from "./PostsStatsCard";
import StatCard from "./StatCard";
import AddCardDialog from "./add-card-dialog";
import EditLayoutButton from "./edit-layout-button";
import { DashboardRangePicker } from "./range-picker";
const GridLayout = dynamic(() => import("react-grid-layout"), { ssr: false });

export default function HomePage() {
  const dispatch = useAppDispatch();
  const [changeConfig] = useChangeDashboardConfigMutation();
  const { layout } = useAppSelector((state) => state.dashboard);
  const { toggle: toggleEditValue, value: isEdit } = useBoolean(false);

  const {
    data: dashboardConfig,
    isLoading,
    isSuccess,
  } = useGetDashboardConfigQuery();

  const [containerRef, { width: containerWidth = 0 }] = useElementSize();

  const width = useMemo(() => {
    return max([containerWidth, 650]);
  }, [containerWidth]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(changeLayout(dashboardConfig.data ?? []));
    }
  }, [isSuccess, dashboardConfig]);

  const handleToggleEditLayout = useCallback(() => {
    toggleEditValue();
  }, [toggleEditValue]);

  const handleLayoutChange = useCallback(
    async (l: Layout[]) => {
      const newLayout = l
        .map((item) => {
          const oldItem = layout.find((old) => old.i === item.i);
          if (oldItem) {
            return { ...oldItem, ...item };
          }
          return null;
        })
        .filter(Boolean) as DashboardConfig[];

      dispatch(changeLayout(newLayout));
    },
    [layout],
  );

  const handleRemoveCard = useCallback(
    (i: string) => async () => {
      dispatch(removeCard(i));
      const newLayout = layout.filter((item) => item.i !== i);
      await changeConfig(newLayout).unwrap();
    },
    [layout],
  );

  const handleChangeAggregation = useCallback(
    (i: string, aggregation: EAggregation) => async () => {
      const newLayout = layout.map((item) => {
        if (item.i === i) {
          return { ...item, aggregation };
        }
        return item;
      });
      await changeConfig(newLayout).unwrap();
      dispatch(changeLayout(newLayout));
    },
    [layout],
  );

  return (
    <div className="flex h-screen flex-col space-y-2 px-4 py-4">
      <div className="mb-5 flex flex-wrap items-center justify-between md:px-4">
        <h2 className="text-2xl font-bold">Home</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardRangePicker />
          {(layout.length === 0 || isEdit) && <AddCardDialog />}
          {layout.length > 0 && (
            <EditLayoutButton
              handleToggleEditLayout={handleToggleEditLayout}
              isEdit={isEdit}
            />
          )}
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : layout.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              No cards to show
            </h1>
          </div>
        ) : (
          <ScrollArea className="h-fit w-full">
            <GridLayout
              className={cn("w-full", isEdit && "grid-background")}
              layout={
                layout.map((item) => ({
                  ...item,
                  minW: getDashboardCardMinWidth(item.type),
                  minH: getDashboardCardMinHeight(item.type),
                })) as Layout[]
              }
              cols={12}
              rowHeight={30}
              width={width}
              isDraggable={isEdit}
              isResizable={isEdit}
              onLayoutChange={handleLayoutChange}
              useCSSTransforms
            >
              {layout.map((item) => {
                if (item.type === EDashboardCardType.Stat) {
                  return (
                    <div key={item.i}>
                      <StatCard
                        {...item}
                        handleRemoveCard={handleRemoveCard}
                        handleChangeAggregation={handleChangeAggregation}
                      />
                    </div>
                  );
                } else if (item.type === EDashboardCardType.Graph) {
                  return (
                    <div key={item.i}>
                      <GraphCard
                        {...item}
                        handleRemoveCard={handleRemoveCard}
                      />
                    </div>
                  );
                } else if (item.type === EDashboardCardType.EventsCalendar) {
                  return (
                    <div key={item.i}>
                      <CalendarCard
                        {...item}
                        handleRemoveCard={handleRemoveCard}
                      />
                    </div>
                  );
                } else if (item.type === EDashboardCardType.PostsStats) {
                  return (
                    <div key={item.i}>
                      <PostsStatsCard
                        {...item}
                        handleRemoveCard={handleRemoveCard}
                      />
                    </div>
                  );
                }
              })}
            </GridLayout>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
