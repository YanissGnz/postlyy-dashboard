import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Iconify from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn, getEventIcon, hasAccount } from "@/lib/utils";
import {
  calendarApiUtil,
  useAddRecurringPostMutation,
  useAddSpotMutation,
  useUpdateRecurringPostMutation,
  useUpdateSpotMutation,
} from "@/redux/api/calendar/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { EPostSpotType } from "@/types/EPostSpotType";
import { EProviders } from "@/types/EProviders";
import { type TCalendarSpot } from "@/types/TCalendarSpot";
import { type TRecurringPost } from "@/types/TRecurringPost";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { format, setHours } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { DEFAULT_POST_ID } from "./post-details";

type Props = {
  form: UseFormReturn<TRecurringPost | TCalendarSpot, unknown, undefined>;
  isEdit?: boolean;
  id?: string | null;
};

export const DAYS_OF_WEEK = [
  {
    label: "Sunday",
    value: 0,
  },
  {
    label: "Monday",
    value: 1,
  },
  {
    label: "Tuesday",
    value: 2,
  },
  {
    label: "Wednesday",
    value: 3,
  },
  {
    label: "Thursday",
    value: 4,
  },
  {
    label: "Friday",
    value: 5,
  },
  {
    label: "Saturday",
    value: 6,
  },
];

export default function AddEditEventForm({ form, isEdit, id }: Props) {
  const { data } = useSession();

  const [addSpot, { isLoading: isAddSpotLoading }] = useAddSpotMutation();
  const [updateSpot, { isLoading: isUpdateSpotLoading }] =
    useUpdateSpotMutation();
  const [addRecurringSpot, { isLoading: isAddRecurringSpotLoading }] =
    useAddRecurringPostMutation();
  const [updateRecurringSpot, { isLoading: isUpdateRecurringSpotLoading }] =
    useUpdateRecurringPostMutation();

  const [isRecurring, setIsRecurring] = useState(false);

  const dispatch = useAppDispatch();

  function onSubmit(values: TCalendarSpot | TRecurringPost) {
    if (isRecurring) {
      const startTime = new Date(
        setHours(
          new Date(),
          Number((values.startTime as string)!.split(":")[0]!),
        ).setMinutes(Number((values.startTime as string)!.split(":")[1])),
      );

      const body = {
        ...values,
        startTime,
        start: startTime,
        postId: values.postId === DEFAULT_POST_ID ? null : values.postId,
      };

      if (isEdit && id)
        updateRecurringSpot({ ...body, id } as TRecurringPost & { id: string })
          .unwrap()
          .then(() => {
            form.reset();
            toast.success("Recurring post updated successfully");
            calendarApiUtil.invalidateTags(["Recurring"]);
          })
          .catch((err) => {
            toast.error("Something went wrong");
            console.log(err);
          });
      else
        addRecurringSpot(body as TRecurringPost)
          .unwrap()
          .then(() => {
            form.reset();
            toast.success("Recurring post added successfully");
            calendarApiUtil.invalidateTags(["Recurring"]);
          })
          .catch((err) => {
            toast.error("Something went wrong");
            console.log(err);
          });
    } else {
      if (isEdit)
        updateSpot({
          ...values,
          start: new Date((values as TCalendarSpot).start).toISOString(),
          id,
          postId: values.postId === DEFAULT_POST_ID ? null : values.postId,
        } as TCalendarSpot & { id: string })
          .unwrap()
          .then(() => {
            form.reset();
            toast.success("Spot updated successfully");
            calendarApiUtil.invalidateTags(["Spot"]);
          })
          .catch((err) => {
            toast.error("Something went wrong");
            console.log(err);
          });
      else
        addSpot({
          ...values,
          start: new Date((values as TCalendarSpot).start).toISOString(),
          postId: values.postId === DEFAULT_POST_ID ? null : values.postId,
        } as TCalendarSpot)
          .unwrap()
          .then(() => {
            form.reset();
            toast.success("Spot added successfully");
            calendarApiUtil.invalidateTags(["Spot"]);
          })
          .catch((err) => {
            toast.error("Something went wrong");
            console.log(err);
          });
    }
    if (isEdit) dispatch(closeModal("edit-calendar-post-modal"));
    else dispatch(closeModal("add-calendar-post-modal"));
  }

  useEffect(() => {
    setIsRecurring(form.getValues("type") === 3);
  }, [form]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === "3") {
                      setIsRecurring(true);
                    } else {
                      setIsRecurring(false);
                    }
                    field.onChange(Number(value));
                  }}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <Iconify
                          icon={getEventIcon(EPostSpotType.Scheduled)}
                          fontSize={18}
                        />
                        Scheduled
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <Iconify
                          icon={getEventIcon(EPostSpotType.Evergreen)}
                          fontSize={18}
                        />
                        Evergreen
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex items-center gap-2">
                        <Iconify
                          icon={getEventIcon(EPostSpotType.Recurring)}
                          fontSize={18}
                        />
                        Recurring
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />{" "}
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
          {!isRecurring && (
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={
                        Boolean(field.value)
                          ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(
                          new Date(e.target.value).toLocaleString(),
                        );
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {isRecurring && (
            <FormField
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Days of the week</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-fit w-full flex-wrap justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value?.length ? (
                              <div className="flex flex-1 flex-wrap items-center gap-2">
                                {field.value.map((day) => (
                                  <Badge variant="outline">
                                    {
                                      DAYS_OF_WEEK.find((d) => d.value === day)
                                        ?.label
                                    }
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              "Select days of the week"
                            )}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search framework..."
                            className="h-9"
                          />
                          <CommandEmpty>No framework found.</CommandEmpty>
                          <CommandGroup>
                            {DAYS_OF_WEEK.map((day) => (
                              <CommandItem
                                value={day.label}
                                key={day.value}
                                onSelect={() => {
                                  if (
                                    form
                                      .getValues("daysOfWeek")
                                      ?.includes(day.value)
                                  ) {
                                    field.onChange(
                                      form
                                        .getValues("daysOfWeek")
                                        ?.filter((d) => d !== day.value),
                                    );
                                    return;
                                  } else {
                                    field.onChange([
                                      ...(form.getValues("daysOfWeek") ?? []),
                                      day.value,
                                    ]);
                                  }
                                }}
                              >
                                {day.label}
                                <CheckIcon
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    field.value?.includes(day.value)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {isRecurring && (
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      value={(field.value as string) ?? "00:00"}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {hasAccount(EProviders.Twitter, data?.user.accounts) && (
            <FormField
              control={form.control}
              name="forTwitter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Twitter Slot</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {hasAccount(EProviders.Linkedin, data?.user.accounts) && (
            <FormField
              control={form.control}
              name="forLinkedIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>LinkedIn Slot</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <Button
            type="submit"
            disabled={
              isAddSpotLoading ||
              isAddRecurringSpotLoading ||
              isUpdateSpotLoading ||
              isUpdateRecurringSpotLoading
            }
            loading={
              isAddSpotLoading ||
              isAddRecurringSpotLoading ||
              isUpdateSpotLoading ||
              isUpdateRecurringSpotLoading
            }
          >
            {isEdit ? "Update" : "Add"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
