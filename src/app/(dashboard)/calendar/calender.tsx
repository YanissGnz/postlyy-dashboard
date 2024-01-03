/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// calendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { useGetEventsQuery } from "@/redux/api/calendar/apiSlice";
import { Spinner } from "@/components/ui/Spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { EPostSpotType } from "@/types/EPostSpotType";
import { type EventSourceInput } from "@fullcalendar/core/index.js";
import Iconify from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { type TRecurringPost } from "@/types/TRecurringPost";
import { type TCalendarSpot } from "@/types/TCalendarSpot";
import { type EventImpl } from "@fullcalendar/core/internal";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { getBackgroundColor, getIcon, getTextColor } from "@/lib/utils";
import { format } from "date-fns";

export default function Calender() {
  const calenderRef = useRef<FullCalendar>(null);
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState(
    calenderRef.current?.getApi().view.title ?? "",
  );
  const { data, isLoading, isFetching } = useGetEventsQuery();

  const events: EventSourceInput = useMemo(() => {
    if (data?.data) {
      return data.data.map((event) => ({
        ...event,
        backgroundColor: getBackgroundColor(event.type),
        textColor: getTextColor(event.type),
        extendedProps: {
          icon: getIcon(event.type),
          ...event,
        },
        ...(event.type === EPostSpotType.Recurring && {
          daysOfWeek: event.days,
          startTime: format(new Date(event.startTime), "HH:mm"),
        }),
      }));
    }
    return [];
  }, [data?.data, isLoading, isFetching]);

  useEffect(() => {
    if (calenderRef.current) {
      setTitle(calenderRef.current?.getApi().view.title ?? "");
    }
  }, [calenderRef.current?.getApi().view.title]);

  const handleOpenDeleteEventModal = useCallback(
    (id: string, type: EPostSpotType) =>
      (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        dispatch(
          openModal({ id: "delete-calendar-post-modal", data: { id, type } }),
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
            id: "edit-calendar-post-modal",
            data: event.extendedProps as TCalendarSpot | TRecurringPost,
          }),
        );
      },
    [],
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
                <SelectItem value="timeGrid">Week</SelectItem>
                <SelectItem value="listWeek">List</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <h2 className="flex-1 font-medium" key={title}>
          {title}
        </h2>
        <Button
          onClick={() =>
            dispatch(
              openModal({
                id: "add-calendar-post-modal",
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
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        events={events}
        initialView="timeGrid"
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        height="auto"
        allDaySlot={false}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          dispatch(
            openModal({
              id: "calendar-post-details-modal",
              data: info.event.extendedProps as TCalendarEvent,
            }),
          );
        }}
        dateClick={(info) => {
          dispatch(
            openModal({
              id: "add-calendar-post-modal",
              data: {
                date: info.dateStr,
              },
            }),
          );
        }}
        dayHeaderClassNames="font-bold bg-background text-foreground"
        visibleRange={(currentDate) => {
          const startDate = new Date(currentDate.valueOf());
          const endDate = new Date(currentDate.valueOf());

          startDate.setDate(startDate.getDate());
          endDate.setDate(endDate.getDate() + 7);

          return { start: startDate, end: endDate };
        }}
        eventContent={(eventInfo) => {
          const { event } = eventInfo;

          if (calenderRef.current?.getApi().view.type === "listWeek")
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
          return (
            <div className="flex items-center gap-2">
              <Iconify
                icon={event.extendedProps.icon}
                className="flex-none"
                fontSize={18}
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
