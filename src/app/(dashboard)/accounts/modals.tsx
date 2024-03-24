"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";

import { buttonVariants } from "@/components/ui/button";
import { useCallback } from "react";

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
import { useDeleteAccountMutation } from "@/redux/api/user/account/apiSlice";
import { toast } from "sonner";

export default function Modals() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();
  const [deleteAccount] = useDeleteAccountMutation();

  const handleDeleteAccount = useCallback(() => {
    const { id } = list.find((modal) => modal.id === "delete-account-modal")
      ?.data as {
      id: string;
    };
    dispatch(closeModal("delete-account-modal"));

    if (!id) {
      return;
    }

    const deletePromise = deleteAccount(id).unwrap();

    toast.promise(deletePromise, {
      loading: "Deleting account...",
      success: "Account deleted successfully",
      error: "Failed to delete account",
    });
  }, [list]);

  return (
    <>
      <AlertDialog
        open={list.some((modal) => modal.id === "delete-account-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("delete-account-modal"));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you absolutely sure you want to delete this account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              account and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
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
