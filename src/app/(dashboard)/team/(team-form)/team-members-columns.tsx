"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";

import { type TSubordinate } from "@/types/TSubordinate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/env";
import { teamApi } from "@/redux/api/user/team/apiSlice";
import { store } from "@/redux/store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const handleDeleteMember = async (subordinateId: string) => {
  await store
    .dispatch(teamApi.endpoints.deleteSubordinate.initiate(subordinateId))
    .unwrap()
    .then(() => {
      toast.success("Subordinate deleted successfully");
    })
    .catch(() => {
      toast.error("Something went wrong");
    });
};

const handleDeleteManager = async (managerId: string) => {
  await store
    .dispatch(teamApi.endpoints.deleteManager.initiate(managerId))
    .unwrap()
    .then(() => {
      toast.success("Manager deleted successfully");
    })
    .catch(() => {
      toast.error("Something went wrong");
    });
};

export const teamMembersColumns: ColumnDef<TSubordinate>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row: { original } }) => {
      return (
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              src={env.NEXT_PUBLIC_API_BASE_URL + original?.photoUrl ?? ""}
              alt={`@${original?.fullName}`}
            />
            <AvatarFallback>
              {original?.fullName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{original.fullName}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "userType",
    header: "Type",
    cell: ({
      row: {
        original: { userType },
      },
    }) => {
      if (userType === 10) return <Badge variant="outline">Member</Badge>;
      if (userType === 2) return <Badge variant="destructive">Manager</Badge>;
      if (userType === 0) return <Badge variant="default">Owner</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (row.original.userType === 0) return null;
      if (row.original.userType === 2)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Iconify icon="ic:round-more-vert" className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleDeleteManager(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Iconify icon="ic:round-more-vert" className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleDeleteMember(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
