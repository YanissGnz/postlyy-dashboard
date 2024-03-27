import ErrorCard from "@/components/error-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { convertToLocalDate } from "@/lib/utils";
import { useGetTicketQuery } from "@/redux/api/support/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { ETicketStatus } from "@/types/ETicketStatus";
import { ETicketType } from "@/types/ETicketType";
import { format } from "date-fns";
import { useMemo } from "react";

const getTicketTypeText = (type: ETicketType) => {
  switch (type) {
    case ETicketType.FeatureRequest:
      return "Feature Request";
    case ETicketType.Incident:
      return "Incident";
    case ETicketType.Problem:
      return "Problem";
    case ETicketType.Question:
      return "Question";
    case ETicketType.TechnicalSupport:
      return "Technical Support";
    default:
      return "Other";
  }
};

const getTicketStatusText = (status: ETicketStatus) => {
  switch (status) {
    case ETicketStatus.Closed:
      return "Closed";
    case ETicketStatus.Open:
      return "Open";
    case ETicketStatus.InProgress:
      return "In Progress";
    default:
      return "Other";
  }
};

export default function TicketDetails() {
  const { list } = useAppSelector((state) => state.modals);
  const dispatch = useAppDispatch();

  const id = useMemo(() => {
    const modal = list.find((modal) => modal.id === "ticket-details-modal");
    return (modal?.data as { id: string } | undefined)?.id;
  }, [list]);

  const {
    data: ticket,
    isLoading,
    isSuccess,
    refetch,
  } = useGetTicketQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  return (
    <Sheet
      open={list.some((modal) => modal.id === "ticket-details-modal")}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeModal("ticket-details-modal"));
        }
      }}
    >
      <SheetContent className="md:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-36" />
            ) : isSuccess ? (
              ticket.data.title
            ) : (
              "Ticket Details"
            )}
          </SheetTitle>
          <ScrollArea
            style={{
              height: "calc(100vh - 70px)",
            }}
          >
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : isSuccess ? (
              <div className="space-y-2">
                <div className="flex items-center gap-5">
                  <p className="font-medium">Type:</p>
                  <div className="flex items-center gap-1">
                    <span>{getTicketTypeText(ticket.data.type)}</span>
                  </div>
                </div>{" "}
                <div className="flex items-center gap-5">
                  <p className="font-medium">Created at:</p>
                  <div className="flex items-center gap-1">
                    <span>
                      {format(convertToLocalDate(ticket.data.createdAt), "PPp")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <p className="font-medium">Last update:</p>
                  <div className="flex items-center gap-1">
                    <span>
                      {format(
                        convertToLocalDate(ticket.data.lastUpdateAt),
                        "PPp",
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <p className="font-medium">Status:</p>
                  <div className="flex items-center gap-1">
                    <span>{getTicketStatusText(ticket.data.status)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Context:</p>
                  <div className="flex items-center gap-1">
                    <span>{ticket.data.context}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Respones:</p>
                  {ticket.data.responses.length === 0 ? (
                    <div className="flex h-16 items-center justify-center">
                      <p className="text-destructive">No responses yet</p>
                    </div>
                  ) : (
                    ticket.data.responses.map((response) => (
                      <div key={response.id} className="rounded border p-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{response.writtenBy}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              convertToLocalDate(response.writtenAt),
                              "PPp",
                            )}
                          </p>
                        </div>
                        <p>{response.response}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <ErrorCard
                title="Failed to load ticket details"
                refetchFunction={refetch}
              />
            )}
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
