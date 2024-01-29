"use client";

import { useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import {
  useGetPowerupsQuery,
  useUpdateAutoPlugMutation,
} from "@/redux/api/user/powerups/apiSlice";
import LoadingCard from "@/components/loading-card";
import ErrorCard from "@/components/error-card";
import { toast } from "sonner";

export default function PowerupsPage() {
  const { list } = useAppSelector((state) => state.modals);
  const { currentAccount } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [updateAutoPlug] = useUpdateAutoPlugMutation();

  const accountId = useMemo(() => currentAccount?.id, [currentAccount?.id]);

  const {
    data: powerups,
    isLoading,
    isSuccess,
    refetch,
  } = useGetPowerupsQuery(accountId!, {
    skip: !accountId,
    refetchOnMountOrArgChange: true,
  });

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        dispatch(
          openModal({
            id: "twitter-autoplug",
            data: null,
          }),
        );
      } else {
        if (powerups?.data.autoPlug.activate && Boolean(accountId)) {
          const data = new FormData();

          data.append("activate", "false");

          powerups?.data.autoPlug.autoPlugMessages.forEach((message, index) => {
            data.append(`autoPlugMessages[${index}].message`, message.message);
          });

          const promise = updateAutoPlug({
            accountId: accountId!,
            body: data,
          }).unwrap();

          toast.promise(promise, {
            loading: "Updating auto plug...",
            success: "Auto plug updated!",
            error: "Something went wrong!",
          });
        }
      }
    },
    [accountId, powerups?.data.autoPlug.activate],
  );

  return isLoading ? (
    <LoadingCard />
  ) : isSuccess ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card className="">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Iconify icon="simple-icons:x" />X (Twitter) Autoplug
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Auto reply to your own tweets to share links or promos in the
            comments.
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-end">
          <Switch
            onCheckedChange={handleCheckedChange}
            checked={
              list.some((modal) => modal.id === "twitter-autoplug") ||
              powerups.data.autoPlug.activate
            }
          />
        </CardFooter>
      </Card>
    </div>
  ) : (
    <ErrorCard title="Something went wrong" refetchFunction={refetch} />
  );
}
