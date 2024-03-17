"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { convertToLocalDate } from "@/lib/utils";
import { ETicketStatus } from "@/types/ETicketStatus";
import { ETicketType } from "@/types/ETicketType";
import { type TTicket } from "@/types/TTicket";
import { format } from "date-fns";

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
];
