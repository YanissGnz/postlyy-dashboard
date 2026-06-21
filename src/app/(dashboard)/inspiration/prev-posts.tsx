"use client";

import ErrorCard from "@/components/error-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/lib/auth/client";
import { useGetBestPostsQuery } from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";

type Props = {
  handleImportPost: (postId: string) => () => void;
  skip: boolean;
};

export default function PrevPosts({ handleImportPost, skip }: Props) {
  const { data: session } = useAuth();

  const currentAccount = useAppSelector((state) => state.auth.currentAccount);

  const pagination = usePagination();

  const {
    data: bestPosts,
    isLoading: isPostsLoading,
    isSuccess: isPostSuccess,
    refetch,
  } = useGetBestPostsQuery(
    {
      otherUsers: false,
      PageNumber: pagination.pageNumber,
      PageSize: pagination.pageSize,
    },
    {
      skip,
    },
  );

  return (
    <div className="space-y-2">
      <h1 className="text-muted-foreground">
        You can import a post content from your old posts to generate!
        inspiration
      </h1>
      <TooltipProvider>
        <ScrollArea className="mt-2 h-[80vh]">
          {isPostsLoading ? (
            <div className="h-full space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full" />
              ))}
            </div>
          ) : isPostSuccess ? (
            bestPosts.data.length > 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-col">
                  {bestPosts.data.map((post) => (
                    <div className="mb-4 flex flex-col rounded border">
                      <div className="p-2">
                        <div className="my-3 flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={currentAccount?.photoUrl ?? ""}
                              alt={`@${currentAccount?.username}`}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {currentAccount?.username
                                ?.slice(0, 2)
                                .toUpperCase() ?? ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold">
                              {" "}
                              {session?.fullName ??
                                currentAccount?.username}
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
                              <p className="text-center">Retweets and shares</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="gap2 flex items-center">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleImportPost(post.id)}
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
      </TooltipProvider>
      {bestPosts?.data && bestPosts?.data?.length > 10 && (
        <DataTablePagination
          {...pagination}
          totalPages={bestPosts?.totalPages ?? 1}
        />
      )}
    </div>
  );
}
