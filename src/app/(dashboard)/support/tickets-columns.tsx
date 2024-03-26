"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";
import { convertToLocalDate } from "@/lib/utils";
import { openModal } from "@/redux/slices/modalsSlice";
import { store } from "@/redux/store";
import { ETicketStatus } from "@/types/ETicketStatus";
import { ETicketType } from "@/types/ETicketType";
import { type TTicket } from "@/types/TTicket";
import { format } from "date-fns";

const handleOpenTicketResponseModal =
  (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    store.dispatch(
      openModal({
        id: "add-ticket-response-modal",
        data: { id },
      }),
    );
  };

export const ticketsColumns: ColumnDef<TTicket>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({
      row: {
        original: { type },
      },
    }) => {
      if (type === ETicketType.FeatureRequest)
        return <Badge variant="outline">Feature Request</Badge>;
      if (type === ETicketType.Incident)
        return <Badge variant="outline">Incident</Badge>;
      if (type === ETicketType.Problem)
        return <Badge variant="outline">Problem</Badge>;
      if (type === ETicketType.Question)
        return <Badge variant="outline">Question</Badge>;
      if (type === ETicketType.TechnicalSupport)
        return <Badge variant="outline">Technical Support</Badge>;
      return null;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({
      row: {
        original: { createdAt },
      },
    }) => format(convertToLocalDate(createdAt), "MM/dd/yyyy"),
  },
  {
    accessorKey: "lastUpdateAt",
    header: "Last Update",
    cell: ({
      row: {
        original: { lastUpdateAt },
      },
    }) => format(convertToLocalDate(lastUpdateAt), "MM/dd/yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({
      row: {
        original: { status },
      },
    }) => {
      if (status === ETicketStatus.Open)
        return <Badge variant="outline">Open</Badge>;
      if (status === ETicketStatus.Closed)
        return <Badge variant="default">Closed</Badge>;
      if (status === ETicketStatus.InProgress)
        return <Badge variant="default">In Progress</Badge>;

      return null;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row: { original } }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Iconify icon="ic:round-more-vert" className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleOpenTicketResponseModal(original.id)}
            >
              <Iconify
                icon="solar:chat-square-arrow-bold-duotone"
                fontSize={20}
                className="mr-2"
              />
              Add Response
            </DropdownMenuItem>{" "}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
