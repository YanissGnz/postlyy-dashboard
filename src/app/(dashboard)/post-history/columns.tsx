"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Iconify from "@/components/ui/icon";
import { type TPostHistory } from "@/types/TPostHistory";

export const columns: ColumnDef<TPostHistory>[] = [
  {
    accessorKey: "text",
    header: "Post",
    cell: ({
      row: {
        original: { text },
      },
    }) => {
      return (
        <p className="truncate">
          {text.length > 50 ? text.slice(0, 50) + "..." : text}
        </p>
      );
    },
  },
  {
    id: "providers",
    header: "Social Media",
    cell: ({
      row: {
        original: { onTwitter, onLinkedIn },
      },
    }) => {
      return (
        <div className="flex gap-2">
          {onTwitter && <Iconify icon="simple-icons:x" />}
          {onLinkedIn && <Iconify icon="simple-icons:linkedin" />}
        </div>
      );
    },
  },
  {
    accessorKey: "impressions",
    header: "Impressions",
  },
  {
    accessorKey: "likes",
    header: "Likes",
  },
  {
    accessorKey: "replies",
    header: "Replies",
  },
  {
    accessorKey: "retweets",
    header: "Retweets / Shares",
  },
];
