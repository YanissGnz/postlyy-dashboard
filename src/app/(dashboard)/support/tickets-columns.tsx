"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { ETicketType } from "@/types/ETicketType";
import { type TTicket } from "@/types/TTicket";

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
];
