"use client";

import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { ROUTES } from "@/routes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SupportButton() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { push } = useRouter();

  const [withBottomButtons, setWithBottomButtons] = useState(false);

  const handleOpenTicketModal = useCallback(() => {
    push(ROUTES.support);

    dispatch(
      openModal({
        id: "add-ticket-modal",
        data: null,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const bottomButtons = document.getElementById("bottom-buttons");
    setWithBottomButtons(!!bottomButtons);
  }, [pathname]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "fixed right-6 h-10 w-10 rounded-full p-4 transition-all duration-300",
              withBottomButtons ? "bottom-16" : "bottom-6",
            )}
            size={"icon"}
            onClick={handleOpenTicketModal}
          >
            <Iconify icon="ic:twotone-contact-support" fontSize={24} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>
            <strong>Need help?</strong>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
