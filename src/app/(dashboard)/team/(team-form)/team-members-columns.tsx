"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Iconify from "@/components/ui/icon";

import { type TTeamMember } from "@/types/TTeamMember";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/types/env";
import { teamApi } from "@/redux/api/user/team/apiSlice";
import { store } from "@/redux/store";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EUserType } from "@/types/EUserType";

const handleDeleteMember = async (subordinateId: string) => {
  const deleteMemberPromise = store
    .dispatch(teamApi.endpoints.deleteTeamMember.initiate(subordinateId))
    .unwrap();

  toast.promise(deleteMemberPromise, {
    loading: "Deleting member...",
    success: () => {
      return `Member deleted successfully`;
    },
    error: "Something went wrong",
  });
};

const handleDeleteManager = async (managerId: string) => {
  const deleteManagerPromise = store
    .dispatch(teamApi.endpoints.deleteManager.initiate(managerId))
    .unwrap();

  toast.promise(deleteManagerPromise, {
    loading: "Deleting manager...",
    success: () => {
      return `Manager deleted successfully`;
    },
    error: "Something went wrong",
  });
};

export const teamMembersColumns: ColumnDef<TTeamMember>[] = [
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
      if (userType === EUserType.TeamMember)
        return <Badge variant="outline">Team Member</Badge>;
      if (userType === EUserType.Manager)
        return <Badge variant="destructive">Manager</Badge>;
      if (userType === EUserType.Owner)
        return <Badge variant="default">Owner</Badge>;
    },
  },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({
      row: {
        original: { manager },
      },
    }) => {
      if (!manager) return "You";
      return manager;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (row.original.userType === EUserType.Owner) return null;
      if (row.original.userType === EUserType.Manager)
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Iconify icon="ic:round-more-vert" className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this manager?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  manager.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  asChild
                  className={buttonVariants({ variant: "destructive" })}
                >
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteManager(row.original.id)}
                  >
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Iconify icon="ic:round-more-vert" className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this member?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                member.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                asChild
                className={buttonVariants({ variant: "destructive" })}
              >
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteMember(row.original.id)}
                >
                  Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];
