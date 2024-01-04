import Iconify from "@/components/ui/icon";
import { getIcon, getTypeName } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { EPostSpotType } from "@/types/EPostSpotType";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { format } from "date-fns";
import React, { useMemo } from "react";
import { DAYS_OF_WEEK } from "./add-edit-event-form";

export default function PostDetails() {
  const { list } = useAppSelector((state) => state.modals);

  const event: TCalendarEvent | null = useMemo(() => {
    const found = list.find(
      (modal) => modal.id === "calendar-post-details-modal",
    );
    if (found) {
      return found.data as TCalendarEvent;
    }
    return null;
  }, [list]);

  if (!event) {
    return <div>Event Not Found</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-5">
        <p className="font-medium">Type:</p>
        <div className="flex items-center gap-1">
          <Iconify icon={getIcon(event.type)} fontSize={24} />
          <span>{getTypeName(event.type)}</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <p className="font-medium">Title:</p>
        <p>{event.title}</p>
      </div>
      <div className="flex items-center gap-5">
        <p className="font-medium">Date / Time:</p>
        {event.type === EPostSpotType.Recurring ? (
          <p>
            {event.days
              .map((day) => {
                const dayName = DAYS_OF_WEEK.find((d) => d.value === day);
                return dayName?.label;
              })
              .join(", ")}{" "}
            {format(new Date(event.start), "p")}
          </p>
        ) : (
          <p>
            {format(new Date(event.start), "PPP") +
              " " +
              format(new Date(event.start), "p")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-5">
        <p className="font-medium">Socials:</p>
        <div className="flex items-center gap-2">
          {event.forTwitter && (
            <Iconify
              icon="simple-icons:x"
              className="flex-none"
              fontSize={20}
            />
          )}
          {event.forLinkedIn && (
            <Iconify
              icon="simple-icons:linkedin"
              className="flex-none"
              fontSize={20}
            />
          )}
        </div>
      </div>
    </div>
  );
}
