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
import {
  useDeleteDraftMutation,
  useDeleteTemplateMutation,
} from "@/redux/api/post/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { useCallback } from "react";
import { toast } from "sonner";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();
  const [deleteDraft] = useDeleteDraftMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const handleDeleteDraft = useCallback(async () => {
    const id = list.find((modal) => modal.id === "delete-draft-modal")
      ?.data as string;

    if (!id) return dispatch(closeModal("delete-draft-modal"));

    const deleteDraftPromise = deleteDraft(id).unwrap();

    toast.promise(deleteDraftPromise, {
      loading: "Deleting draft...",
      success: () => {
        return "Draft deleted successfully";
      },
      error: "Something went wrong",
    });
  }, [list]);

  const handleDeleteTemplate = useCallback(async () => {
    const id = list.find((modal) => modal.id === "delete-template-modal")
      ?.data as string;

    if (!id) return dispatch(closeModal("delete-template-modal"));

    const deleteDraftPromise = deleteTemplate(id).unwrap();

    toast.promise(deleteDraftPromise, {
      loading: "Deleting template...",
      success: () => {
        return "Template deleted successfully";
      },
      error: "Something went wrong",
    });
  }, [list]);

  return (
    <>
      <AlertDialog
        open={list.some((modal) => modal.id === "delete-draft-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("delete-draft-modal"));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDraft}
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={list.some((modal) => modal.id === "delete-template-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("delete-template-modal"));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
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
