"use client";

import { type HTMLAttributes, useCallback, useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, sub } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { type DateRange } from "react-day-picker";
import { changeDashboardDateRange } from "@/redux/slices/dashboardSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESET_RANGES = [
  {
    label: "Last Week",
    range: [sub(new Date(), { days: 7 }), new Date()],
    value: "0",
  },
  {
    label: "Last Month",
    range: [sub(new Date(), { months: 1 }), new Date()],
    value: "1",
  },
  {
    label: "Last 3 Months",
    range: [sub(new Date(), { months: 3 }), new Date()],
    value: "2",
  },
  {
    label: "Last 6 Months",
    range: [sub(new Date(), { months: 6 }), new Date()],
    value: "3",
  },
  {
    label: "Last Year",
    range: [sub(new Date(), { years: 1 }), new Date()],
    value: "4",
  },
];

export function DashboardRangePicker({
  className,
}: HTMLAttributes<HTMLDivElement>) {
  const { endDate, startDate } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("");

  const handleRangeChange = useCallback((selected: DateRange | undefined) => {
    const { from, to } = selected ?? {
      from: sub(new Date(), { days: 30 }),
      to: new Date(),
    };

    dispatch(
      changeDashboardDateRange({
        startDate:
          from?.toISOString() ?? sub(new Date(), { days: 30 }).toISOString(),
        endDate: to?.toISOString() ?? new Date().toISOString(),
      }),
    );
    setValue("");
  }, []);

  const handlePresetChange = useCallback((value: string) => {
    setValue(value);
    const range = PRESET_RANGES.find((r) => r.value === value)?.range;
    if (range) {
      dispatch(
        changeDashboardDateRange({
          startDate:
            range[0]?.toISOString() ??
            sub(new Date(), { days: 30 }).toISOString(),
          endDate: range[1]?.toISOString() ?? new Date().toISOString(),
        }),
      );
    }
  }, []);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !(startDate && endDate) && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              endDate ? (
                <>
                  {format(new Date(startDate), "LLL dd, y")} -{" "}
                  {format(new Date(endDate), "LLL dd, y")}
                </>
              ) : (
                format(new Date(startDate), "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Select onValueChange={handlePresetChange} value={value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a range" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="0">Last Week</SelectItem>
              <SelectItem value="1">Last Month</SelectItem>
              <SelectItem value="2">Last 3 Months</SelectItem>
              <SelectItem value="3">Last 6 Months</SelectItem>
              <SelectItem value="4">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={new Date(startDate)}
            selected={{
              from: new Date(startDate),
              to: new Date(endDate),
            }}
            onSelect={handleRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
