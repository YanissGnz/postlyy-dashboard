"use client";

import React, { useCallback } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/redux/hooks";
import { addCard } from "@/redux/slices/dashboardSlice";
import { useBoolean } from "usehooks-ts";
import { EAggregation } from "@/types/EAggregation";
import { EStatType } from "@/types/EStatType";
import { EDashboardCardType } from "@/types/EDashboardCardType";

const DASHBOARD_QUERIES = [
  {
    name: "Impressions",
    value: 0,
  },
  {
    name: "Likes",
    value: 1,
  },
  {
    name: "Replies",
    value: 2,
  },
  {
    name: "Retweets",
    value: 3,
  },
  {
    name: "Link Clicks",
    value: 4,
  },
  {
    name: "Profile Clicks",
    value: 5,
  },
  {
    name: "Follows",
    value: 6,
  },
  {
    name: "Posts",
    value: 7,
  },
  {
    name: "Schedules",
    value: 8,
  },
];

function getCardTitle(type: EDashboardCardType, value?: number) {
  if (
    (type === EDashboardCardType.Graph || type === EDashboardCardType.Stat) &&
    value
  ) {
    return (
      DASHBOARD_QUERIES.find((query) => query.value === value)?.name ?? "Card"
    );
  } else if (type === EDashboardCardType.Table) {
    return "Table";
  } else if (type === EDashboardCardType.EventsCalendar) {
    return "Events Calendar";
  }

  return "Card";
}

const formSchema = z
  .object({
    type: z.enum(["stat", "graph", "table", "events-calendar"]),
    description: z.string().optional(),
    query: z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "8"]).optional(),
  })
  .refine((data) => data.type !== "graph" && data.type !== "stat", {
    message: "Please select a data type",
    path: ["query"],
  });

export default function AddCardDialog() {
  const dispatch = useAppDispatch();

  const { setValue, value: isOpen } = useBoolean(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      query: "0",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const title = getCardTitle(
      values.type as EDashboardCardType,
      values.query ? parseInt(values.query) : undefined,
    );

    dispatch(
      addCard({
        title,
        type: values.type as EDashboardCardType,
        query: values.query
          ? (parseInt(values.query) as EStatType)
          : EStatType.Follows,
        aggregation: EAggregation.Total,
        description: values.description,
      }),
    );
    setValue(false);
    form.reset();
  }

  const handleOpenChange = useCallback((open: boolean) => {
    setValue(open);
    form.reset();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Card</Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add a card</DialogTitle>
              <DialogDescription>
                Add a new card to your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-2 space-y-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stat">Stat</SelectItem>
                        <SelectItem value="graph">Graph</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="events-calendar">
                          Today's Schedule
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.watch("type") === "stat" ||
                form.watch("type") === "graph") && (
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DASHBOARD_QUERIES.map((query) => (
                            <SelectItem
                              key={query.value}
                              value={query.value.toString()}
                            >
                              {query.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add card</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
