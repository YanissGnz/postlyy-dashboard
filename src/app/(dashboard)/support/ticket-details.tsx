import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";

export default function TicketDetails() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();

  return (
    <Sheet
      open={list.some((modal) => modal.id === "add-calendar-post-modal")}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeModal("add-calendar-post-modal"));
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle> Ticket Details</SheetTitle>
          <div>{/* TODO: add details */}</div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
