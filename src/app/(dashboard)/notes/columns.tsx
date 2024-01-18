"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";

import { ROUTES } from "@/routes";
import { store } from "@/redux/store";
import { openModal } from "@/redux/slices/modalsSlice";
import Link from "next/link";
import { type TNote } from "@/types/TNote";

const handleOpenDeleteNoteModal = (id: string) => () => {
  store.dispatch(
    openModal({
      id: "delete-note-modal",
      data: id,
    }),
  );
};

export const columns: ColumnDef<TNote>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({
      row: {
        original: { id },
      },
    }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Iconify icon="eva:more-vertical-fill" fontSize={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.notes.view(id)}>
                {" "}
                <Iconify
                  icon="solar:eye-bold-duotone"
                  fontSize={20}
                  className="mr-2"
                />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.notes.edit(id)}>
                {" "}
                <Iconify
                  icon="solar:pen-bold-duotone"
                  fontSize={20}
                  className="mr-2"
                />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleOpenDeleteNoteModal(id)}>
              <Iconify
                icon="solar:trash-bin-2-bold-duotone"
                fontSize={20}
                className="mr-2"
              />{" "}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
