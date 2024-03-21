import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetNotesQuery } from "@/redux/api/notes/apiSlice";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import ErrorCard from "../../../components/error-card";
import { usePagination } from "../../../hooks/usePagination";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  openNote: (id: string) => void;
};

export default function NotesSheet({ isOpen, setIsOpen, openNote }: Props) {
  const { pageNumber, pageSize } = usePagination();

  const {
    data: notes,
    isLoading,
    isSuccess,
    refetch,
  } = useGetNotesQuery({
    PageNumber: pageNumber,
    PageSize: pageSize,
  });

  const handleOpenNote = useCallback(
    (id: string) => () => {
      openNote && openNote(id);
    },
    [],
  );

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notes</SheetTitle>
          </SheetHeader>
          <ScrollArea
            className="space-y-2"
            style={{ height: "calc(100vh - 64px)" }}
          >
            {isLoading ? (
              <div className="flex h-56 items-center justify-center">
                <Spinner />
              </div>
            ) : isSuccess ? (
              notes.data.length > 0 ? (
                <div className="flex flex-col">
                  <div className="flex flex-col gap-2">
                    {notes.data.map((note) => (
                      <div className="flex items-center justify-between rounded border p-1">
                        <p className="font-medium">{note.name}</p>
                        <div className="gap2 flex items-center">
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                size="icon"
                                type="button"
                                variant="ghost"
                                onClick={handleOpenNote(note.id)}
                              >
                                <Iconify
                                  icon="solar:square-forward-bold-duotone"
                                  className="text-foreground/80"
                                  fontSize={18}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-center">Open</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center">
                  <div className="text-muted-foreground">No notes found</div>
                </div>
              )
            ) : (
              <ErrorCard refetchFunction={refetch} />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
