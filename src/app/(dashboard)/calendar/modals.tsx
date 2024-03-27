"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { calendarSpotSchema, type TCalendarSpot } from "@/types/TCalendarSpot";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useDeleteRecurringPostMutation,
  useDeleteSpotMutation,
} from "@/redux/api/calendar/apiSlice";
import { type TRecurringPost } from "@/types/TRecurringPost";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EPostSpotType } from "@/types/EPostSpotType";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { addHours, format } from "date-fns";
import AddEditEventForm from "./add-edit-event-form";
import PostDetails from "./post-details";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();

  const [deleteRecurringPost] = useDeleteRecurringPostMutation();
  const [deleteSpot] = useDeleteSpotMutation();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const defaultValues = useMemo(() => {
    const isEdit = list.find(
      (modal) => modal.id === "edit-calendar-spot-modal",
    );

    if (isEdit) {
      const data = isEdit.data as TCalendarEvent;
      return {
        type: data.type,
        title: data.title,
        start: data.start,
        forTwitter: data.forTwitter,
        forLinkedIn: data.forLinkedIn,
        postId: data.postId,
        startTime: data.startTime,
        daysOfWeek: data.days,
      };
    }

    const data = list.find((modal) => modal.id === "add-calendar-spot-modal")
      ?.data as { date: string } | undefined;

    return {
      type: 0,
      title: "",
      start: data?.date ? new Date(data.date).toISOString() : "",
      postId: null,
      startTime: "",
      daysOfWeek: [],
      forTwitter: false,
      forLinkedIn: false,
    };
  }, [list]);

  const form = useForm<TCalendarSpot | TRecurringPost>({
    resolver: zodResolver(calendarSpotSchema),
    defaultValues,
  });

  useEffect(() => {
    const isEdit = list.find(
      (modal) => modal.id === "edit-calendar-spot-modal",
    );

    if (isEdit) {
      const data = isEdit.data as TCalendarEvent;
      form.setValue("type", data.type);
      form.setValue("title", data.title);
      form.setValue("start", data.start);
      form.setValue("forTwitter", data.forTwitter);
      form.setValue("forLinkedIn", data.forLinkedIn);
      form.setValue("postId", data.postId);
      form.setValue("startTime", format(new Date(data.startTime), "HH:mm"));
      form.setValue("daysOfWeek", data.days);
      setSelectedEventId(data.id);
    } else if (list.find((modal) => modal.id === "add-calendar-spot-modal")) {
      const data = list.find((modal) => modal.id === "add-calendar-spot-modal")
        ?.data as { date: string } | undefined;
      form.setValue(
        "start",
        data?.date
          ? addHours(new Date(data.date), 1).toISOString().slice(0, 16)
          : "",
      );
    }
  }, [list]);

  const handleDeleteEvent = useCallback(() => {
    const { id, type } = list.find(
      (modal) => modal.id === "delete-calendar-spot-modal",
    )?.data as {
      id: string;
      type: EPostSpotType;
    };

    if (type === EPostSpotType.Recurring) {
      const deletePostPromise = deleteRecurringPost(id).unwrap();

      toast.promise(deletePostPromise, {
        loading: "Deleting recurring spot",
        success: () => {
          return "Recurring spot deleted successfully";
        },
        error: "Something went wrong",
      });
    } else {
      const deleteSpotPromise = deleteSpot(id).unwrap();

      toast.promise(deleteSpotPromise, {
        loading: "Deleting spot..",
        success: () => {
          return `Spot deleted successfully`;
        },
        error: "Something went wrong",
      });
    }
    dispatch(closeModal("delete-calendar-spot-modal"));
  }, [list]);

  return (
    <>
      <Sheet
        open={list.some((modal) => modal.id === "add-calendar-spot-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("add-calendar-spot-modal"));
            form.reset();
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Spot</SheetTitle>
            <AddEditEventForm form={form} />
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet
        open={list.some((modal) => modal.id === "edit-calendar-spot-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("edit-calendar-spot-modal"));
            form.reset();
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Spot</SheetTitle>
            <AddEditEventForm form={form} isEdit id={selectedEventId} />
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet
        open={list.some((modal) => modal.id === "calendar-post-details-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("calendar-post-details-modal"));
          }
        }}
      >
        <PostDetails />
      </Sheet>

      <AlertDialog
        open={list.some((modal) => modal.id === "delete-calendar-spot-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("delete-calendar-spot-modal"));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this spot?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              spot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
