"use client";

import dynamic from "next/dynamic";
import StatCard from "./StatCard";
import { useCallback, useEffect, useMemo, useRef } from "react";
import GraphCard from "./GraphCard";
import AddCardDialog from "./add-card-dialog";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { type Layout } from "react-grid-layout";
import { changeLayout, removeCard } from "@/redux/slices/dashboardSlice";
import { type DashboardConfig } from "@/types/DashboardConfig";
import {
  useChangeDashboardConfigMutation,
  useGetDashboardConfigQuery,
} from "@/redux/api/user/dashboard/apiSlice";
import LoadingCard from "@/components/loading-card";
import { Button } from "@/components/ui/button";
import { useBoolean } from "usehooks-ts";
import Iconify from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { type EAggregation } from "@/types/EAggregation";
const GridLayout = dynamic(() => import("react-grid-layout"), { ssr: false });

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const [changeConfig] = useChangeDashboardConfigMutation();
  const { layout } = useAppSelector((state) => state.dashboard);
  const { toggle: toggleEditValue, value: isEdit } = useBoolean(false);

  const {
    data: dashboardConfig,
    isLoading,
    isSuccess,
  } = useGetDashboardConfigQuery();

  const width = useMemo(() => {
    if (containerRef.current) {
      return containerRef.current.offsetWidth;
    }
    return 800;
  }, [containerRef.current?.offsetWidth]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(changeLayout(dashboardConfig.data ?? []));
    }
  }, [isSuccess, dashboardConfig]);

  const handleEditLayout = useCallback(() => {
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

      await changeConfig(newLayout).unwrap();
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
      <div className="mb-5 flex items-center justify-between md:px-4">
        <h2 className="text-2xl font-bold">Home</h2>
        <div className="flex items-center gap-2">
          {layout.length > 0 && (
            <Button variant="outline" onClick={handleEditLayout}>
              <Iconify
                icon={
                  isEdit
                    ? "solar:check-circle-bold-duotone"
                    : "solar:ruler-cross-pen-bold-duotone"
                }
                className="mr-2 h-5 w-5"
              />
              {isEdit ? "Done" : "Edit"}
            </Button>
          )}
          <AddCardDialog />
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        {isLoading ? (
          <LoadingCard />
        ) : layout.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center">
            <h1 className="text-2xl font-bold text-muted-foreground">
              No cards to show
            </h1>
          </div>
        ) : (
          <GridLayout
            className={cn("w-ful", isEdit && "grid-background")}
            layout={
              layout.map((item) => ({
                ...item,
                minW: item.type === "stat" ? 2 : 6,
                minH: item.type === "stat" ? 4 : 8,
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
              if (item.type === "stat") {
                return (
                  <div key={item.i}>
                    <StatCard
                      {...item}
                      handleRemoveCard={handleRemoveCard}
                      handleChangeAggregation={handleChangeAggregation}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={item.i}>
                    <GraphCard
                      {...item}
                      handleRemoveCard={handleRemoveCard}
                      handleChangeAggregation={handleChangeAggregation}
                    />
                  </div>
                );
              }
            })}
          </GridLayout>
        )}
      </div>
    </div>
  );
}
