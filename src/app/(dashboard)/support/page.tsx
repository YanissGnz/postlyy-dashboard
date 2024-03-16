"use client";

import { useBoolean } from "usehooks-ts";
// api

// components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useGetAllTicketsQuery } from "@/redux/api/support/apiSlice";
import AddTicketForm from "./add-ticket-form";
import { ticketsColumns } from "./tickets-columns";
import { TicketsDataTable } from "./tickets-data-table";

export default function Support() {
  const pagination = usePagination();

  const { data: subordinates, isLoading } = useGetAllTicketsQuery({
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
  });

  const {
    value: isTicketDialogOpen,
    setFalse: setTicketDialogFalse,
    setTrue: setTicketDialogTrue,
    setValue: setTicketDialogValue,
  } = useBoolean(false);

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-4">
        <Dialog
          open={isTicketDialogOpen}
          onOpenChange={(open) => setTicketDialogValue(open)}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setTicketDialogTrue()}>New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Ticket</DialogTitle>
            </DialogHeader>
            <AddTicketForm closeModal={setTicketDialogFalse} />
          </DialogContent>
        </Dialog>
      </div>
      <TicketsDataTable
        columns={ticketsColumns}
        data={subordinates?.data ?? []}
        loading={isLoading}
      />
      <DataTablePagination
        {...pagination}
        totalPages={subordinates?.totalPages ?? 0}
      />
    </>
  );
}
