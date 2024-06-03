import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDismissNotificationMutation,
  useGetNotificationsQuery,
} from "@/redux/api/notifications/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNotificationsSheet } from "@/redux/slices/layoutSlice";
import { ENotificationType } from "@/types/ENotificationType";
import { type TNotification } from "@/types/TNotification";
import { useCallback } from "react";

export default function NotificationsSheet() {
  const { isNotificationsSheetOpen } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();

  const {
    data: notifications,
    isLoading,
    isSuccess,
    refetch,
  } = useGetNotificationsQuery({ page: 0 }, { pollingInterval: 60000 });

  return (
    <Sheet
      open={isNotificationsSheetOpen}
      onOpenChange={(open) => {
        dispatch(setNotificationsSheet(open));
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2">
            Notifications{" "}
            {notifications?.data?.length && `(${notifications?.data.length})`}
            <Button variant="outline" onClick={refetch}>
              <Iconify icon="solar:refresh-bold-duotone" fontSize={20} />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full w-full max-w-full py-4">
          {isLoading && <Skeleton className="h-10 w-full" />}
          {isSuccess && notifications.data.length > 0 ? (
            notifications.data.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <div className="flex h-56 items-center justify-center">
              No notifications
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

const getNotificationIcon = (type: ENotificationType) => {
  switch (type) {
    case ENotificationType.Normal:
      return "solar:bell-bold-duotone";
    case ENotificationType.DayStreak:
      return "fluent-emoji-flat:heart-on-fire";
    case ENotificationType.WeeklyStreak:
      return "fluent-emoji:heart-on-fire";
    case ENotificationType.RecordStreak:
      return "noto:heart-on-fire";
    case ENotificationType.StreakFailed:
      return "solar:sad-circle-bold-duotone";
    case ENotificationType.Stats:
      return "solar:chart-bold-duotone";
    case ENotificationType.Reminder:
      return "solar:clock-circle-bold-duotone";
    default:
      return "solar:bell-bold-duotone";
  }
};

const getNotificationTitle = (type: ENotificationType) => {
  switch (type) {
    case ENotificationType.Normal:
      return "Notification";
    case ENotificationType.DayStreak:
      return "Day streak";
    case ENotificationType.WeeklyStreak:
      return "Weekly streak";
    case ENotificationType.RecordStreak:
      return "Record streak";
    case ENotificationType.StreakFailed:
      return "Streak failed";
    case ENotificationType.Stats:
      return "Stats";
    case ENotificationType.Reminder:
      return "Reminder";
    default:
      return "Notification";
  }
};

const NotificationItem = ({
  notification,
}: {
  notification: TNotification;
}) => {
  const [dismiss, { isLoading }] = useDismissNotificationMutation();

  const handleDismiss = useCallback(async () => {
    await dismiss(notification.id);
  }, [dismiss, notification.id]);

  return (
    <div className="mb-3 w-full max-w-[335px] rounded border p-2 sm:max-w-[335px]">
      <div className="mb-2 flex items-center justify-start">
        <Iconify
          icon={getNotificationIcon(notification.type)}
          fontSize={24}
          className="mr-2"
        />
        <h2 className="grow text-base font-medium">
          {getNotificationTitle(notification.type)}
        </h2>
        <Button variant="ghost" onClick={handleDismiss} loading={isLoading}>
          <Iconify
            icon="solar:archive-check-bold-duotone"
            fontSize={20}
            className={cn(isLoading && "hidden")}
          />
        </Button>
      </div>
      <p className="overflow-hidden break-words text-sm">{notification.text}</p>
    </div>
  );
};
