"use client";

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
import { buttonVariants } from "@/components/ui/button";
import { useDeleteNoteMutation } from "@/redux/api/notes/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { useCallback } from "react";
import { toast } from "sonner";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();
  const [deleteNote] = useDeleteNoteMutation();

  const handleDeleteNote = useCallback(async () => {
    const id = list.find((modal) => modal.id === "delete-note-modal")
      ?.data as string;

    if (!id) return dispatch(closeModal("delete-note-modal"));

    const deleteNotePromise = deleteNote(id).unwrap();

    toast.promise(deleteNotePromise, {
      loading: "Deleting note...",
      success: () => {
        return "Note deleted successfully";
      },
      error: "Something went wrong",
    });
  }, [list]);

  return (
    <>
      <AlertDialog
        open={list.some((modal) => modal.id === "delete-note-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("delete-note-modal"));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this note?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
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
