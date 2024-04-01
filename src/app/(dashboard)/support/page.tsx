"use client";

// api

// components
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useGetAllTicketsQuery } from "@/redux/api/support/apiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { useCallback } from "react";
import { ticketsColumns } from "./tickets-columns";
import { TicketsDataTable } from "./tickets-data-table";

export default function Support() {
  const pagination = usePagination();

  const { data: subordinates, isLoading } = useGetAllTicketsQuery({
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
  });

  const dispatch = useAppDispatch();

  const handleOpenTicketModal = useCallback(() => {
    dispatch(
      openModal({
        id: "add-ticket-modal",
        data: null,
      }),
    );
  }, [dispatch]);

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-4">
        <Button onClick={handleOpenTicketModal}>New Ticket</Button>
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
