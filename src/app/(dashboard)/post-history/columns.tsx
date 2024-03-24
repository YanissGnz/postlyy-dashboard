"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { type TPostHistory } from "@/types/TPostHistory";

export const columns: ColumnDef<TPostHistory>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
];
