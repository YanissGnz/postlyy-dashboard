"use client";

import React, { useCallback, useState } from "react";
import { useBoolean } from "usehooks-ts";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
// api
import {
  useAddManagerMutation,
  useAddSubordinateMutation,
  useGetManagersQuery,
  useGetSubordinatesQuery,
} from "@/redux/api/user/team/apiSlice";
// components
import { TeamMembersDataTable } from "./team-member-data-table";
import { teamMembersColumns } from "./team-members-columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeamForm() {
  const { data: managers, isSuccess: isManagerSuccess } = useGetManagersQuery();
  const { data: subordinates, isLoading } = useGetSubordinatesQuery();
  const [addManager, { isLoading: isAddManagerLoading }] =
    useAddManagerMutation();
  const [addSubordinate, { isLoading: isAddSubLoading }] =
    useAddSubordinateMutation();

  const session = useSession();

  const { value: isOpen, setFalse, setTrue, setValue } = useBoolean(false);
  const {
    value: isManagerDialogOpen,
    setFalse: setManagerDialogFalse,
    setTrue: setManagerDialogTrue,
    setValue: setManagerDialogValue,
  } = useBoolean(false);

  const [email, setEmail] = useState("");

  const handleAddManager = useCallback(async () => {
    await addManager({ email })
      .unwrap()
      .then(() => {
        setEmail("");
        toast.success("Manager added successfully");
        setManagerDialogFalse();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  }, [email]);

  const handleAddSubordinate = useCallback(async () => {
    await addSubordinate({ email })
      .unwrap()
      .then(() => {
        setEmail("");
        toast.success("Subordinate added successfully");
        setFalse();
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  }, [email]);

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-4">
        {session.data?.user.tier === 2 &&
          isManagerSuccess &&
          managers?.data.length < 2 && (
            <Dialog
              open={isManagerDialogOpen}
              onOpenChange={(open) => setManagerDialogValue(open)}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setManagerDialogTrue()}>
                  Add Manager
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Manager</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddManager}
                    loading={isAddManagerLoading}
                    disabled={!email || isAddManagerLoading}
                  >
                    Invite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        <Dialog open={isOpen} onOpenChange={(open) => setValue(open)}>
          <DialogTrigger asChild>
            <Button onClick={() => setTrue()}>Add Subordinate</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Subordinate</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddSubordinate}
                loading={isAddSubLoading}
                disabled={!email || isAddSubLoading}
              >
                Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <TeamMembersDataTable
        columns={teamMembersColumns}
        data={subordinates?.data ?? []}
        loading={isLoading}
      />
    </>
  );
}
