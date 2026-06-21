/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth/client";
import {
  cn,
  getEventBackgroundColor,
  getEventIcon,
  getEventTextColor,
  hasAccount,
} from "@/lib/utils";
import {
  useGetEventsQuery,
  useUpdateRecurringPostMutation,
  useUpdateSpotMutation,
} from "@/redux/api/calendar/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { EPostSpotType } from "@/types/EPostSpotType";
import { EProviders } from "@/types/EProviders";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { type TCalendarSpot } from "@/types/TCalendarSpot";
import { type TRecurringPost } from "@/types/TRecurringPost";
import {
  type EventDropArg,
  type EventInput,
} from "@fullcalendar/core/index.js";
import { type EventImpl } from "@fullcalendar/core/internal";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridWeekPlugin from "@fullcalendar/timegrid";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { max, min } from "lodash";
import { useTheme } from "next-themes";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { DEFAULT_POST_ID } from "./post-details";

export default function Calender() {
  const calenderRef = useRef<FullCalendar>(null);
  const dispatch = useAppDispatch();
  const { data: session } = useAuth();
  const { theme } = useTheme();

  const [title, setTitle] = useState(
    calenderRef.current?.getApi().view.title ?? "",
  );

  const [startHour, setStartHour] = useState("07:00:00");
  const [endHour, setEndHour] = useState("24:00:00");

  useEffect(() => {
    if (calenderRef.current) {
      setTitle(calenderRef.current?.getApi().view.title ?? "");
    }
  }, [calenderRef.current?.getApi().view.title]);

  const { data, isLoading } = useGetEventsQuery();

  const [updateSpot, { isLoading: isUpdating }] = useUpdateSpotMutation();

  const [updateRecurringSpot] = useUpdateRecurringPostMutation();
  console.log("🚀 :", {
    startHour,
    endHour,
  });

  const events: EventInput[] = useMemo(() => {
    if (data?.data) {
      const minStartHour = new Date();
      minStartHour.setHours(7, 0, 0, 0);
      const maxEndHour = new Date();
      maxEndHour.setHours(24, 0, 0, 0);

      return data.data
        .filter(
          (event) =>
            (event.forLinkedIn &&
              hasAccount(EProviders.Linkedin, session?.accounts)) ||
            (event.forTwitter &&
              hasAccount(EProviders.Twitter, session?.accounts)),
        )
        .map((event) => {
          if (minStartHour.getHours() > new Date(event.start).getHours()) {
            minStartHour.setHours(new Date(event.start).getHours());
          }

          if (maxEndHour.getHours() < new Date(event.start).getHours()) {
            maxEndHour.setHours(new Date(event.start).getHours() + 2);
          }

          setStartHour(min([minStartHour.getHours(), 7]) + ":00:00");

          setEndHour(max([maxEndHour.getHours(), 21]) + ":00:00");

          return {
            ...event,
            // end: addHours(new Date(event.start), 1),
            backgroundColor:
              event.postId !== DEFAULT_POST_ID
                ? getEventBackgroundColor(event.type, theme === "dark")
                : "#0000",
            color:
              event.postId !== DEFAULT_POST_ID
                ? getEventBackgroundColor(event.type, theme === "dark")
                : theme === "dark"
                  ? "#da5b5b"
                  : "#ef4444",
            textColor: getEventTextColor(event.type),
            editable: true,
            eventDurationEditable: false,
            eventResizableFromStart: false,
            extendedProps: {
              icon: getEventIcon(event.type),
              ...event,
            },
            ...(event.type === EPostSpotType.Recurring && {
              daysOfWeek: event.days,
              startTime: format(new Date(event.startTime), "HH:mm"),
            }),
          };
        });
    }
    return [];
  }, [data?.data, isLoading, theme]);

  const emptyDays: EventInput[] = useMemo(() => {
    const availableDays =
      data?.data
      .filter(
          (event) =>
            (event.forLinkedIn &&
              hasAccount(EProviders.Linkedin, session?.accounts)) ||
            (event.forTwitter &&
              hasAccount(EProviders.Twitter, session?.accounts)),
        )
        .map((event) => {
          const start = new Date(event.start);
          const end = new Date(event.start);
          end.setHours(end.getHours() + 1);

          return {
            start: new Date(start.setHours(0, 0, 0)),
            end: new Date(end.setHours(23, 59, 59)),
          };
        }) ?? [];
    const monthDays = Array.from(
      { length: 30 },
      (_, i) => addDays(new Date(), i + 1),
      [],
    );

    return monthDays
      .map((day) => {
        if (
          !availableDays?.some(
            (d) => isAfter(day, d.start) && isBefore(day, d.end),
          )
        )
          return {
            start: new Date(day.setHours(0, 0, 0)),
            end: new Date(day.setHours(23, 59, 59)),
            display: "background",
            backgroundColor: "#ff0000ab",
          };
        else return null;
      })
      .filter(Boolean) as EventInput[];
  }, [data]);

  const handleOpenDeleteEventModal = useCallback(
    (id: string, type: EPostSpotType) =>
      (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        dispatch(
          openModal({ id: "delete-calendar-spot-modal", data: { id, type } }),
        );
      },
    [],
  );

  const handleOpenEditEventModal = useCallback(
    (event: EventImpl) =>
      (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        dispatch(
          openModal({
            id: "edit-calendar-spot-modal",
            data: event.extendedProps as TCalendarSpot | TRecurringPost,
          }),
        );
      },
    [],
  );

  const handleEditEvent = useCallback(
    async (info: EventDropArg) => {
      const event = info.event.extendedProps as TCalendarEvent;

      if (!event) return;

      if (info.event.start && info.event.start < new Date()) {
        toast.error("You can't move a spot to the past");
        info.revert();
        return;
      }
      if (event.type === EPostSpotType.Recurring) {
        const body: TRecurringPost & { id: string } = {
          ...event,
          daysOfWeek: event.days,
        };

        const updatePromise = updateRecurringSpot(body).unwrap();

        toast.promise(updatePromise, {
          loading: `Updating ${event.title}...`,
          success: async () => {
            return "Spot updated successfully";
          },
          error: "Something went wrong",
        });
      } else {
        const body: TCalendarSpot & { id: string } = {
          ...event,
          start: new Date(info.event.start ?? "").toISOString(),
        };

        const updatePromise = updateSpot(body).unwrap();

        toast.promise(updatePromise, {
          loading: `Updating ${event.title}...`,
          success: async () => {
            return "Spot updated successfully";
          },
          error: "Something went wrong",
        });
      }
    },
    [dispatch],
  );

  if (isLoading)
    return (
      <div className="flex h-56 items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <div className="mb-5 flex w-full items-center gap-5">
        <div className="flex items-center space-x-4">
          <p className="font-medium">View:</p>
          <Select
            onValueChange={(view) => {
              if (calenderRef.current && view) {
                calenderRef?.current?.getApi().changeView(view);
                setTitle(calenderRef.current?.getApi().view.title ?? "");
              }
            }}
            value={calenderRef.current?.getApi().view.type}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a view" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="dayGridMonth">Month</SelectItem>
                <SelectItem value="timeGridWeek">Week</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <h2 className="flex-1 font-medium" key={title}>
          {title}
        </h2>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  onClick={() => {
                    if (
                      calenderRef.current?.getApi().getDate() &&
                      calenderRef.current?.getApi().getDate() >=
                        addDays(new Date(), -30)
                    )
                      calenderRef.current?.getApi().prev();
                  }}
                >
                  <Iconify icon="solar:arrow-left-bold-duotone" fontSize={18} />
                  <span className="sr-only">
                    {calenderRef.current?.getApi().view.type === "list"
                      ? "Previous week"
                      : calenderRef.current?.getApi().view.type ===
                          "dayGridMonth"
                        ? "Previous month"
                        : "Previous week"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {calenderRef.current?.getApi().view.type === "list"
                  ? "Previous week"
                  : calenderRef.current?.getApi().view.type === "dayGridMonth"
                    ? "Previous month"
                    : "Previous week"}
              </TooltipContent>
            </Tooltip>
            <Button
              variant={"outline"}
              onClick={() => {
                calenderRef.current?.getApi().today();
              }}
            >
              Today
            </Button>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  onClick={() => {
                    calenderRef.current?.getApi().next();
                  }}
                >
                  <Iconify
                    icon="solar:arrow-right-bold-duotone"
                    fontSize={18}
                  />
                  <span className="sr-only">
                    {calenderRef.current?.getApi().view.type === "list"
                      ? "Previous week"
                      : calenderRef.current?.getApi().view.type ===
                          "dayGridMonth"
                        ? "Previous month"
                        : "Previous week"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {calenderRef.current?.getApi().view.type === "list"
                  ? "Previous week"
                  : calenderRef.current?.getApi().view.type === "dayGridMonth"
                    ? "Previous month"
                    : "Previous week"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Button
          onClick={() =>
            dispatch(
              openModal({
                id: "add-calendar-spot-modal",
                data: null,
              }),
            )
          }
        >
          <Iconify icon="solar:add-circle-bold-duotone" fontSize={18} />
          <span className="ml-2">Add Spot</span>
        </Button>
      </div>
      <FullCalendar
        ref={calenderRef}
        headerToolbar={false}
        plugins={[
          timeGridWeekPlugin,
          dayGridPlugin,
          listPlugin,
          interactionPlugin,
        ]}
        events={[...events, ...emptyDays]}
        initialView="timeGridWeek"
        height="auto"
        slotMinTime={startHour}
        slotMaxTime={endHour}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          if (info.event.display === "background") return;
          dispatch(
            openModal({
              id: "calendar-post-details-modal",
              data: info.event.extendedProps as TCalendarEvent,
            }),
          );
        }}
        views={{
          list: {
            type: "listWeek",
            duration: { days: 8 },
          },
        }}
        editable={!isUpdating}
        eventDrop={handleEditEvent}
        dateClick={(info) => {
          dispatch(
            openModal({
              id: "add-calendar-spot-modal",
              data: {
                date: info.dateStr,
              },
            }),
          );
        }}
        allDaySlot={false}
        dayHeaderClassNames="font-bold bg-background text-foreground"
        slotDuration={"01:00:00"}
        slotLaneClassNames="!h-14"
        eventContent={(eventInfo) => {
          const { event } = eventInfo;

          if (calenderRef.current?.getApi().view.type === "list")
            return (
              <div className="flex items-center gap-2">
                <Iconify
                  icon={event.extendedProps.icon}
                  className="flex-none"
                  fontSize={24}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <div className="flex items-center gap-2">
                    {event.extendedProps.forTwitter && (
                      <Iconify
                        icon="simple-icons:x"
                        className="flex-none"
                        fontSize={14}
                      />
                    )}
                    {event.extendedProps.forLinkedIn && (
                      <Iconify
                        icon="simple-icons:linkedin"
                        className="flex-none"
                        fontSize={14}
                      />
                    )}
                  </div>{" "}
                </div>
                <div className="space-x-2">
                  <Button
                    size={"icon"}
                    variant="outline"
                    onClick={handleOpenEditEventModal(event)}
                  >
                    <Iconify
                      icon="solar:pen-bold-duotone"
                      className="flex-none"
                      fontSize={18}
                    />
                  </Button>
                  <Button
                    size={"icon"}
                    variant="outline"
                    onClick={handleOpenDeleteEventModal(
                      event.id,
                      event.extendedProps.type as EPostSpotType,
                    )}
                  >
                    <Iconify
                      icon="solar:trash-bin-2-bold-duotone"
                      className="flex-none"
                      fontSize={18}
                    />
                  </Button>
                </div>
              </div>
            );

          if (calenderRef.current?.getApi().view.type === "dayGridMonth")
            return (
              <div
                className={cn(
                  "flex h-12 w-full items-center gap-2 rounded px-2 text-foreground",
                  event.extendedProps.postId === DEFAULT_POST_ID &&
                    "border border-foreground hover:bg-accent",
                  event.start && event.start < new Date() && "opacity-70",
                )}
              >
                <Iconify
                  icon={event.extendedProps.icon}
                  className="flex-none"
                  fontSize={22}
                />
                <div>
                  <div className="flex items-center gap-2">
                    {event.extendedProps.forTwitter && (
                      <Iconify
                        icon="simple-icons:x"
                        className="flex-none"
                        fontSize={14}
                      />
                    )}
                    {event.extendedProps.forLinkedIn && (
                      <Iconify
                        icon="simple-icons:linkedin"
                        className="flex-none"
                        fontSize={14}
                      />
                    )}
                  </div>
                </div>
              </div>
            );

          return (
            <div
              className={cn(
                "flex h-12 w-full items-center gap-2 rounded px-2 text-foreground",
                event.extendedProps.postId === DEFAULT_POST_ID &&
                  "border border-foreground hover:bg-accent",
                event.start &&
                  event.start < new Date() &&
                  "border-none opacity-70",
              )}
            >
              <Iconify
                icon={event.extendedProps.icon}
                className="flex-none"
                fontSize={22}
              />
              <div>
                <div className="flex items-center gap-2">
                  {event.extendedProps.forTwitter && (
                    <Iconify
                      icon="simple-icons:x"
                      className="flex-none"
                      fontSize={14}
                    />
                  )}
                  {event.extendedProps.forLinkedIn && (
                    <Iconify
                      icon="simple-icons:linkedin"
                      className="flex-none"
                      fontSize={14}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
