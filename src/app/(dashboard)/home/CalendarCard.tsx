import { useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import CardDropdown from "./card-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorCard from "@/components/error-card";
import { addHours, format } from "date-fns";
import { type EventSourceInput } from "@fullcalendar/core/index.js";
import {
  getEventBackgroundColor,
  getEventIcon,
  getEventTextColor,
} from "@/lib/utils";
import { EPostSpotType } from "@/types/EPostSpotType";
import Iconify from "@/components/ui/icon";
import dynamic from "next/dynamic";
import listPlugin from "@fullcalendar/list";
import { useGetEventsQuery } from "@/redux/api/calendar/apiSlice";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

export default function CalendarCard({
  i,
  handleRemoveCard,
}: {
  i: string;
  handleRemoveCard: (i: string) => () => void;
}) {
  const { data, isLoading, isError, refetch } = useGetEventsQuery({});

  const events: EventSourceInput = useMemo(() => {
    if (data?.data) {
      return data.data.map((event) => ({
        ...event,
        end: addHours(new Date(event.start), 1),
        backgroundColor: getEventBackgroundColor(event.type),
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
      }));
    }
    return [];
  }, [data?.data, isLoading]);

  if (isLoading) return <Skeleton className="h-full w-full" />;

  if (isError)
    return (
      <ErrorCard
        refetchFunction={refetch}
        title={`Failed to load calendar events`}
        titleClassName="text-sm"
        className="h-full"
      />
    );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex w-full flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex flex-col font-medium">
          Today's Shedule
        </CardTitle>
        <CardDropdown i={i} handleRemoveCard={handleRemoveCard} />
      </CardHeader>
      <ScrollArea className="h-full w-full">
        <FullCalendar
          headerToolbar={false}
          plugins={[listPlugin]}
          events={events}
          initialView="listDay"
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          views={{
            list: {
              type: "listDay",
              duration: { days: 1 },
            },
          }}
          contentHeight="100%"
          dayHeaderClassNames="font-bold bg-background text-foreground"
          visibleRange={(currentDate) => {
            const startDate = new Date(currentDate.valueOf());
            const endDate = new Date(currentDate.valueOf());

            startDate.setDate(startDate.getDate());
            endDate.setDate(endDate.getDate() + 7);

            return { start: startDate, end: endDate };
          }}
          slotDuration={"01:00:00"}
          slotLaneClassNames="!h-14"
          eventContent={(eventInfo) => {
            const { event } = eventInfo;

            return (
              <div className="flex items-center gap-2">
                <Iconify
                  icon={event.extendedProps.icon as string}
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
              </div>
            );
          }}
        />
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  );
}
