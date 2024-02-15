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
import { type TDraft } from "@/types/TDraft";
import { format } from "date-fns";

const handleOpenDeleteTemplateModal = (id: string) => () => {
  store.dispatch(
    openModal({
      id: "delete-template-modal",
      data: id,
    }),
  );
};

export const columns: ColumnDef<TDraft>[] = [
  {
    accessorKey: "text",
    header: "Text",
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
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({
      row: {
        original: { createdAt },
      },
    }) => {
      return format(new Date(createdAt), "dd/MM/yyyy");
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 50,
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
              <Link href={ROUTES.templates.view(id)}>
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
              <Link href={ROUTES.templates.edit(id)}>
                {" "}
                <Iconify
                  icon="solar:pen-bold-duotone"
                  fontSize={20}
                  className="mr-2"
                />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleOpenDeleteTemplateModal(id)}>
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
