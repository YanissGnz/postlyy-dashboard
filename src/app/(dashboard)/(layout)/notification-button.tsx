import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { useGetNotificationsQuery } from "@/redux/api/notifications/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNotificationsSheet } from "@/redux/slices/layoutSlice";
import { useMediaQuery } from "usehooks-ts";

export default function NotificationButton() {
  const dispatch = useAppDispatch();
  const { isNotificationsSheetOpen } = useAppSelector((state) => state.layout);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: notifications } = useGetNotificationsQuery(
    { page: 0 },
    { pollingInterval: 60000 },
  );

  return (
    <Button
      className="aspect-square h-full max-h-14 max-w-full "
      variant={isMobile ? "ghost" : "outline"}
      onClick={() => {
        dispatch(setNotificationsSheet(!isNotificationsSheetOpen));
      }}
    >
      <div className="relative">
        <Badge className="absolute -right-1/2 -top-1/2 m-0 p-0.5 text-xs">
          {notifications?.data?.length &&
            notifications?.data?.length > 0 &&
            notifications?.data.length}
        </Badge>
        <Iconify icon="solar:bell-bing-bold-duotone" className="h-6 w-6" />
      </div>
    </Button>
  );
}
