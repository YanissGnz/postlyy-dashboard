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

const DASHBOARD_QUERIES = [
  {
    name: "Followers",
    value: "followers",
    type: "stat",
  },
  {
    name: "Posts",
    value: "posts",
    type: "stat",
  },
  {
    name: "User Growth",
    value: "user_growth",
    type: "graph",
  },
  {
    name: "Post Growth",
    value: "post_growth",
    type: "graph",
  },
];

const formSchema = z.object({
  type: z.enum(["stat", "graph"]),
  title: z.string().min(3),
  description: z.string().optional(),
  query: z.enum(["followers", "posts", "user_growth", "post_growth"]),
});

export default function AddCardDialog() {
  const dispatch = useAppDispatch();

  const { setValue, value: isOpen } = useBoolean(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "stat",
      title: "",
      description: "",
      query: "followers",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch(addCard(values));
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
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        {DASHBOARD_QUERIES.filter(
                          (query) => query.type === form.getValues("type"),
                        ).map((query) => (
                          <SelectItem key={query.value} value={query.value}>
                            {query.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

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
