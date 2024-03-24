import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { useUpdateSelfRetweetMutation } from "@/redux/api/user/powerups/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { type TPowerups } from "@/types/TPowerups";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

type Props = {
  selfRetweet: TPowerups["selfRetweet"];
};

export default function SelfRetweet({ selfRetweet }: Props) {
  const dispatch = useAppDispatch();
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { list } = useAppSelector((state) => state.modals);

  const accountId = useMemo(() => currentAccount?.id, [currentAccount?.id]);

  const [updateSelfRetweet] = useUpdateSelfRetweetMutation();

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        dispatch(
          openModal({
            id: "self-retweet",
            data: null,
          }),
        );
      } else {
        if (selfRetweet.activate && Boolean(accountId)) {
          const promise = updateSelfRetweet({
            accountId: accountId!,
            body: {
              activate: false,
              condition: selfRetweet.condition,
              conditionValue: selfRetweet.conditionValue,
              delayHours: selfRetweet.delayHours,
            },
          }).unwrap();

          toast.promise(promise, {
            loading: "Updating auto repost...",
            success: "Auto repost updated!",
            error: "Something went wrong!",
          });
        }
      }
    },
    [accountId, selfRetweet.activate],
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Iconify icon="simple-icons:x" />
          <Iconify icon="simple-icons:linkedin" />
          Auto Repost
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">
          Automatically repost your own posts after a certain period of time.
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        <Switch
          onCheckedChange={handleCheckedChange}
          checked={
            list.some((modal) => modal.id === "self-retweet") ||
            selfRetweet.activate
          }
        />
      </CardFooter>
    </Card>
  );
}
