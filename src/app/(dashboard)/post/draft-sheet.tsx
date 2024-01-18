import React, { useCallback, type Dispatch, type SetStateAction } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetDraftsQuery } from "@/redux/api/post/apiSlice";
import { usePagination } from "../../../hooks/usePagination";
import { Spinner } from "@/components/ui/Spinner";
import ErrorCard from "../../../components/error-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Iconify from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { openModal } from "@/redux/slices/modalsSlice";
import { format } from "date-fns";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  editDraft: (id: string) => void;
};

export default function DraftSheet({ isOpen, setIsOpen, editDraft }: Props) {
  const dispatch = useAppDispatch();
  const session = useSession();
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { pageNumber, pageSize } = usePagination();

  const {
    data: drafts,
    isLoading,
    isSuccess,
    refetch,
  } = useGetDraftsQuery({
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
  const handlePublishDraft = useCallback(
    (id: string) => () => {
      editDraft(id);
    },
    [],
  );

  const handleDeleteDraft = useCallback(
    (id: string) => () => {
      dispatch(
        openModal({
          id: "delete-draft-modal",
          data: id,
        }),
      );
    },
    [],
  );

  const handleEditDraft = useCallback(
    (id: string) => () => {
      editDraft(id);
    },
    [],
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Drafts</SheetTitle>
        </SheetHeader>
        <div className="">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Spinner />
            </div>
          ) : isSuccess ? (
            drafts.data.length > 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-col">
                  {drafts.data.map((draft) => (
                    <div className="mb-4 flex flex-col rounded border">
                      <div className="flex items-center justify-between border-b p-1">
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(draft.createdAt),
                            "dd MMM yyyy, HH:mm",
                          )}
                        </p>
                        <div className="gap2 flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                  onClick={handlePublishDraft(draft.id)}
                                >
                                  <Iconify
                                    icon="solar:square-forward-bold-duotone"
                                    className="text-foreground/80"
                                    fontSize={18}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">Publish</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Iconify
                                    icon="solar:trash-bin-2-bold-duotone"
                                    className="text-destructive"
                                    fontSize={18}
                                    onClick={handleDeleteDraft(draft.id)}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-destructive text-destructive-foreground"
                              >
                                <p className="text-center">Delete</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                  onClick={handleEditDraft(draft.id)}
                                >
                                  <Iconify
                                    icon="solar:pen-bold-duotone"
                                    className="text-foreground/80"
                                    fontSize={18}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className=" p-2">
                        <div className="my-3 flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={
                                currentAccount?.photoUrl
                                  ? currentAccount?.photoUrl
                                  : session.data?.user.profilePicture ?? ""
                              }
                              alt={`@${currentAccount?.username}`}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {currentAccount?.username
                                ?.slice(0, 2)
                                .toUpperCase() ??
                                session.data?.user.fullName
                                  ?.slice(0, 2)
                                  .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold">
                              {session.data?.user.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              @
                              {currentAccount?.username
                                .toLowerCase()
                                .split(" ")
                                .join("")}
                            </p>
                          </div>
                        </div>
                        <p>{draft.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center">
                <div className="text-muted-foreground">No drafts found</div>
              </div>
            )
          ) : (
            <ErrorCard refetchFunction={refetch} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
