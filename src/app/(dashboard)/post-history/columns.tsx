"use client";

import { type ColumnDef } from "@tanstack/react-table";

import Iconify from "@/components/ui/icon";
import { openModal } from "@/redux/slices/modalsSlice";
import { store } from "@/redux/store";
import { type TPostHistory } from "@/types/TPostHistory";

const handleOpenPostHistoryModal = (post: TPostHistory) => () => {
  store.dispatch(
    openModal({
      id: "post-history-modal",
      data: post,
    }),
  );
};

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
];
