"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useBoolean, useMediaQuery } from "usehooks-ts";
// api
import {
  useAddManagerMutation,
  useAddTeamMemberMutation,
  useAddTeamMemberToManagerMutation,
  useGetAllMembersQuery,
  useGetManagersQuery,
} from "@/redux/api/user/team/apiSlice";
// components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TErrorResponse } from "@/types/TErrorResponse";
import { TeamMembersDataTable } from "./team-member-data-table";
import { teamMembersColumns } from "./team-members-columns";

export default function TeamForm() {
  const { data: managers } = useGetManagersQuery();
  const { data: subordinates, isLoading } = useGetAllMembersQuery();

  const [addManager, { isLoading: isAddManagerLoading }] =
    useAddManagerMutation();
  const [addTeamMember, { isLoading: isAddSubLoading }] =
    useAddTeamMemberMutation();
  const [addTeamMemberToManager, { isLoading: isAddSubToManagerLoading }] =
    useAddTeamMemberToManagerMutation();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [selectedManagerId, setSelectedManagerId] = useState("default");

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
      .catch((error: { data: TErrorResponse }) => {
        toast.error(error.data[0] ?? "Something went wrong");
      });
  }, [email]);

  const handleAddTeamMember = useCallback(async () => {
    setTrue();
    if (selectedManagerId !== "default") {
      await addTeamMemberToManager({ email, managerId: selectedManagerId })
        .unwrap()
        .then(() => {
          setEmail("");
          toast.success("Team Member added successfully");
          setFalse();
        })
        .catch(() => {
          toast.error("Something went wrong");
          setFalse();
        });
      return;
    }

    await addTeamMember({ email })
      .unwrap()
      .then(() => {
        setEmail("");
        toast.success("Team Member added successfully");
        setFalse();
      })
      .catch((error: { data: TErrorResponse }) => {
        toast.error(error.data[0] ?? "Something went wrong");
        setFalse();
      });
  }, [email]);

  const handleManagerChange = useCallback((managerId: string) => {
    setSelectedManagerId(managerId);
  }, []);

  return (
    <>
      <div className="mb-2 flex items-center justify-end gap-4">
        {isDesktop ? (
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
        ) : (
          <Drawer
            open={isManagerDialogOpen}
            onOpenChange={(open) => setManagerDialogValue(open)}
          >
            <DrawerTrigger asChild>
              <Button>Add Manager</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add Manager</DrawerTitle>
              </DrawerHeader>
              <div className="mb-4 p-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <DrawerFooter>
                <Button
                  type="submit"
                  onClick={handleAddManager}
                  loading={isAddManagerLoading}
                  disabled={!email || isAddManagerLoading}
                >
                  Invite
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
        {isDesktop ? (
          <Dialog open={isOpen} onOpenChange={(open) => setValue(open)}>
            <DialogTrigger asChild>
              <Button onClick={() => setTrue()}>Add Team Member</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
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
                  onClick={handleAddTeamMember}
                  loading={isAddSubLoading}
                  disabled={
                    !email || isAddSubLoading || isAddSubToManagerLoading
                  }
                >
                  Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isOpen} onOpenChange={(open) => setValue(open)}>
            <DrawerTrigger asChild>
              <Button onClick={() => setTrue()}>Add Team Member</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add Team Member</DrawerTitle>
              </DrawerHeader>
              <div className="mb-4 p-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <DrawerFooter>
                <Button
                  type="submit"
                  onClick={handleAddTeamMember}
                  loading={isAddSubLoading}
                  disabled={
                    !email || isAddSubLoading || isAddSubToManagerLoading
                  }
                >
                  Invite
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}

        <p>To</p>
        <Select defaultValue="default" onValueChange={handleManagerChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">You</SelectItem>

            {managers?.data.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TeamMembersDataTable
        columns={teamMembersColumns}
        data={subordinates?.data ?? []}
        loading={isLoading}
      />
    </>
  );
}
