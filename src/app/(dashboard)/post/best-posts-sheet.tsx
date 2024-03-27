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
import { Switch } from "@/components/ui/switch";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetBestPostsQuery } from "@/redux/api/post/apiSlice";
import Image from "next/image";
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
  const pagination = usePagination();
  const [otherUsers, setOtherUsers] = useState(false);

  const {
    data: bestPosts,
    isLoading,
    isSuccess,
    refetch,
  } = useGetBestPostsQuery({
    PageNumber: pagination.pageNumber,
    PageSize: pagination.pageSize,
    otherUsers,
  });

  const handleImportBestPosts = useCallback(
    (id: string) => () => {
      importPost(id);
    },
    [],
  );

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <SheetContent className="md:max-w-xl">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Best Posts</SheetTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="OtherUsers"
                checked={otherUsers}
                onCheckedChange={setOtherUsers}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include other users posts
              </label>
            </div>
          </SheetHeader>
          <ScrollArea className="mt-2 h-[85vh]">
            {isLoading ? (
              <div className="h-full space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 w-full" />
                ))}
              </div>
            ) : isSuccess ? (
              bestPosts.data.length > 0 ? (
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    {bestPosts.data.map((post) => (
                      <div className="mb-4 flex flex-col rounded border">
                        <div className="p-2">
                          <p>{post.text}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {post.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                alt={`Image ${index}`}
                                height={64}
                                width={64}
                                className="h-16 w-16 rounded object-cover"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t px-1">
                          <div className="flex items-center gap-2 divide-x">
                            {" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 p-1">
                                  <Iconify
                                    icon="solar:eye-bold-duotone"
                                    className="text-blue-500"
                                    fontSize={18}
                                  />
                                  <span>{post.impressions}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">
                                  Impressions and views
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 p-1">
                                  <Iconify
                                    icon="solar:heart-angle-bold-duotone"
                                    className="text-red-500"
                                    fontSize={18}
                                  />
                                  <span>{post.likes}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">Likes</p>
                              </TooltipContent>
                            </Tooltip>{" "}
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 p-1">
                                  <Iconify
                                    icon="solar:chat-square-arrow-bold-duotone"
                                    className="text-blue-500"
                                    fontSize={18}
                                  />
                                  <span>{post.replies}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">
                                  Comments and replies
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 p-1">
                                  <Iconify
                                    icon="fa6-solid:retweet"
                                    className="text-green-500"
                                    fontSize={18}
                                  />
                                  <span>{post.retweets}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">
                                  Retweets and shares
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="gap2 flex items-center">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleImportBestPosts(post.id)}
                              className="my-1"
                            >
                              <Iconify
                                icon="solar:square-forward-bold-duotone"
                                className="me-1 text-foreground/80"
                                fontSize={18}
                              />
                              Import
                            </Button>
                          </div>
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
    </TooltipProvider>
  );
}
