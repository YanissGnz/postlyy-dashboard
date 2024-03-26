import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { useAddTicketResponseMutation } from "@/redux/api/support/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export default function AddResponse() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();
  const [response, setResponse] = useState("");

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [addResponse] = useAddTicketResponseMutation();

  const id = useMemo(() => {
    const data = list.find((modal) => modal.id === "add-ticket-response-modal")
      ?.data as { id: string };
    if (!data) {
      return "";
    }
    return data.id;
  }, [list]);

  const handleAddResponse = useCallback(() => {
    if (!id) return;

    dispatch(closeModal("add-ticket-response-modal"));

    const addResponsePromise = addResponse({ id, response }).unwrap();

    toast.promise(addResponsePromise, {
      loading: "Adding response...",
      success: "Response added successfully",
      error: "Error adding response",
    });
    setResponse("");
  }, [addResponse, dispatch, id, response]);

  if (isDesktop)
    return (
      <Dialog
        open={list.some((modal) => modal.id === "add-ticket-response-modal")}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(closeModal("add-ticket-response-modal"));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Response</DialogTitle>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="Type your response here"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddResponse}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer
      open={list.some((modal) => modal.id === "add-ticket-response-modal")}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeModal("add-ticket-response-modal"));
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Response</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <Textarea
            placeholder="Type your response here"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
        <DrawerFooter>
          <Button onClick={handleAddResponse}>Send</Button>
          <DrawerClose asChild>
            <Button variant={"ghost"}>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
