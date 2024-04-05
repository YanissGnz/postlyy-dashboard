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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Layout } from "react-grid-layout";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  type CallBackProps,
  type Step,
} from "react-joyride";
import { useBoolean, useIsMounted, useResizeObserver } from "usehooks-ts";
import CalendarCard from "./CalendarCard";
import GraphCard from "./GraphCard";
import PostsStatsCard from "./PostsStatsCard";
import StatCard from "./StatCard";
import AddCardDialog from "./add-card-dialog";
import EditLayoutButton from "./edit-layout-button";
import { DashboardRangePicker } from "./range-picker";
import UserSelect from "./user-select";
const GridLayout = dynamic(() => import("react-grid-layout"), {
  ssr: false,
});

type State = {
  run: boolean;
  stepIndex: number;
  dialogOpen?: boolean;
  steps: Step[];
};

export default function HomePage() {
  const dispatch = useAppDispatch();
  const [changeConfig] = useChangeDashboardConfigMutation();
  const { layout } = useAppSelector((state) => state.dashboard);
  const { toggle: toggleEditValue, value: isEdit } = useBoolean(false);
  const [{ run, stepIndex, dialogOpen, steps }, setState] = useState<State>({
    run: false,
    stepIndex: 0,
    dialogOpen: false,
    steps: [],
  });
  const { setValue, value: isOpen } = useBoolean(false);

  const {
    data: dashboardConfig,
    isLoading,
    isSuccess,
  } = useGetDashboardConfigQuery();

  const ref = useRef<HTMLDivElement>(null);

  const { width: containerWidth = 0 } = useResizeObserver({
    ref,
    box: "border-box",
  });

  const width = useMemo(() => {
    return max([containerWidth, 800]);
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

  const mounted = useIsMounted();

  useEffect(() => {
    if (mounted()) {
      setState({
        run: true,
        dialogOpen: true,
        steps: [
          {
            content: (
              <div>Click 'Add Card' to add a card to your dashboard</div>
            ),
            disableBeacon: true,
            disableOverlayClose: true,
            hideCloseButton: true,
            hideFooter: true,
            placement: "bottom",
            spotlightClicks: true,
            styles: {
              options: {
                arrowColor: "rgb(var(--popover))",
                backgroundColor: "rgb(var(--popover))",
                textColor: "var(--popover-foreground)",
                zIndex: 10000,
              },
            },
            target: ".step-1",
            title: "Welcome to the Dashboard",
          },
          {
            content: (
              <div>
                Fill in the required fields and click 'Add Card' to add a card
              </div>
            ),
            disableBeacon: true,
            disableOverlayClose: true,
            hideCloseButton: true,
            hideFooter: true,
            placement: "left",
            spotlightClicks: true,
            styles: {
              options: {
                arrowColor: "rgb(var(--popover))",
                backgroundColor: "rgb(var(--popover))",
                textColor: "var(--popover-foreground)",
                zIndex: 10000,
              },
            },
            target: ".step-2",
            title: "Add Card",
          },
        ],
        stepIndex: 0,
      });
    }
  }, [mounted]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setState((prev) => ({
        ...prev,
        run: false,
        stepIndex: 0,
        dialogOpen: false,
      }));
    } else if (
      ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)
    ) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      if (dialogOpen && index === 0) {
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            run: true,
          }));
        }, 400);
      } else if (dialogOpen && index === 1) {
        setState((prev) => ({
          ...prev,
          run: false,
          dialogOpen: false,
          stepIndex: nextStepIndex,
        }));

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            run: true,
          }));
        }, 400);
      } else if (index === 2 && action === ACTIONS.PREV) {
        setState((prev) => ({
          ...prev,
          run: false,
          dialogOpen: true,
          stepIndex: nextStepIndex,
        }));

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            run: true,
          }));
        }, 400);
      } else {
        // Update state to advance the tour
        setState((prev) => ({
          ...prev,
          dialogOpen: false,
          stepIndex: nextStepIndex,
        }));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setState((prev) => ({
        ...prev,
        dialogOpen: true,
        stepIndex: stepIndex === 0 ? 1 : stepIndex,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        dialogOpen: false,
        stepIndex: stepIndex === 1 ? 0 : stepIndex,
      }));
    }
  }, [isOpen]);

  return (
    <div className="flex h-screen flex-col space-y-2 px-4">
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        stepIndex={stepIndex}
        steps={steps}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-4">
        <h2 className="text-2xl font-bold">Home</h2>
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <UserSelect />
          <DashboardRangePicker />
          {(layout.length === 0 || isEdit) && (
            <AddCardDialog isOpen={isOpen} setValue={setValue} />
          )}
          {layout.length > 0 && (
            <EditLayoutButton
              handleToggleEditLayout={handleToggleEditLayout}
              isEdit={isEdit}
            />
          )}
        </div>
      </div>
      <div ref={ref} className="w-full">
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
          <div className="flex h-full min-h-[16rem] w-full flex-col items-center justify-center gap-2">
            <h1 className="text-2xl font-bold">No cards to show</h1>
            <p className="text-muted-foreground">
              Click on the "Add Card" button to add a card to your dashboard
            </p>
          </div>
        ) : (
          <ScrollArea className="h-fit w-full ">
            <GridLayout
              className={cn("w-full", isEdit && "grid-background ")}
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
