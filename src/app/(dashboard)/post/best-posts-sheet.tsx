import { Spinner } from "@/components/ui/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetBestPostsQuery } from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { useSession } from "next-auth/react";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import ErrorCard from "../../../components/error-card";
import { usePagination } from "../../../hooks/usePagination";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  importPost: (id: string) => void;
};

export default function BestPostsSheet({
  isOpen,
  setIsOpen,
  importPost,
}: Props) {
  const session = useSession();
  const { currentAccount } = useAppSelector((state) => state.auth);
  const pagination = usePagination();

  const {
    data: bestPosts,
    isLoading,
    isSuccess,
    refetch,
  } = useGetBestPostsQuery({
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
  });

  const handleImportBestPosts = useCallback(
    (id: string) => () => {
      importPost(id);
    },
    [],
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <SheetContent className="md:max-w-xl">
        <SheetHeader>
          <SheetTitle>Best Posts</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-2 h-[85vh]">
          {isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Spinner />
            </div>
          ) : isSuccess ? (
            bestPosts.data.length > 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-col">
                  {[...bestPosts.data, ...bestPosts.data].map((post) => (
                    <div className="mb-4 flex flex-col rounded border">
                      <div className="flex items-center justify-end border-b p-1">
                        <div className="gap2 flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                  onClick={handleImportBestPosts(post.id)}
                                >
                                  <Iconify
                                    icon="solar:square-forward-bold-duotone"
                                    className="text-foreground/80"
                                    fontSize={18}
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">Import</p>
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
                        <p>{post.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center">
                <div className="text-muted-foreground">No posts found</div>
              </div>
            )
          ) : (
            <ErrorCard refetchFunction={refetch} />
          )}
        </ScrollArea>
        <DataTablePagination
          {...pagination}
          totalPages={bestPosts?.totalPages ?? 1}
        />
      </SheetContent>
    </Sheet>
  );
}
