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
import { useDeleteTemplateMutation } from "@/redux/api/post/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { useCallback } from "react";
import { toast } from "sonner";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const handleDeleteTemplate = useCallback(async () => {
    const id = list.find((modal) => modal.id === "delete-template-modal")
      ?.data as string;

    if (!id) return dispatch(closeModal("delete-template-modal"));

    const deleteTemplatePromise = deleteTemplate(id).unwrap();

    toast.promise(deleteTemplatePromise, {
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
