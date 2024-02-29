import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { useUpdateAutoPlugMutation } from "@/redux/api/user/powerups/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { type TPowerups } from "@/types/TPowerups";
import React, { useCallback, useMemo } from "react";
import { toast } from "sonner";

type Props = {
  autoPlug: TPowerups["autoPlug"];
};

export default function TwitterAutoPlug({ autoPlug }: Props) {
  const dispatch = useAppDispatch();
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { list } = useAppSelector((state) => state.modals);

  const accountId = useMemo(() => currentAccount?.id, [currentAccount?.id]);

  const [updateAutoPlug] = useUpdateAutoPlugMutation();

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
        if (autoPlug.activate && Boolean(accountId)) {
          const data = new FormData();

          data.append("activate", "false");

          autoPlug.autoPlugMessages.forEach((message, index) => {
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
    [accountId, autoPlug.activate],
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Iconify icon="simple-icons:x" />X (Twitter) Autoplug
        </div>
      </CardHeader>
      <CardContent className="flex-1">
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
            autoPlug.activate
          }
        />
      </CardFooter>
    </Card>
  );
}
