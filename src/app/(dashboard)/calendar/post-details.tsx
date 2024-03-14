import ErrorCard from "@/components/error-card";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEventIcon, getTypeName } from "@/lib/utils";
import { useGetScheduledPostByIdQuery } from "@/redux/api/post/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { ROUTES } from "@/routes";
import { EPostSpotType } from "@/types/EPostSpotType";
import { EProviders } from "@/types/EProviders";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DAYS_OF_WEEK } from "./add-edit-event-form";

export const DEFAULT_POST_ID = "00000000-0000-0000-0000-000000000000";

export default function PostDetails() {
  const { list } = useAppSelector((state) => state.modals);
  const { currentAccount } = useAppSelector((state) => state.auth);
  const session = useSession();
  const dispatch = useAppDispatch();
  const { push } = useRouter();

  const postId = useMemo(() => {
    const found = list.find(
      (modal) => modal.id === "calendar-post-details-modal",
    );
    if (found) {
      return (found.data as TCalendarEvent).postId === DEFAULT_POST_ID
        ? null
        : (found.data as TCalendarEvent).postId;
    }
    return null;
  }, [list]);

  const {
    data: postData,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
    refetch: refetchPostData,
  } = useGetScheduledPostByIdQuery(postId!, {
    skip: !postId || postId === DEFAULT_POST_ID,
    refetchOnMountOrArgChange: true,
  });

  const [previewSocial, setPreviewSocial] = useState(
    postData?.data.onTwitter ? "twitter" : "linkedin",
  );

  useEffect(() => {
    if (postData?.data.onTwitter) {
      setPreviewSocial("twitter");
    } else setPreviewSocial("linkedin");
  }, [postData]);

  const event: TCalendarEvent | null = useMemo(() => {
    const found = list.find(
      (modal) => modal.id === "calendar-post-details-modal",
    );
    if (found) {
      return found.data as TCalendarEvent;
    }
    return null;
  }, [list]);

  const handleOpenDeleteEventModal = useCallback(
    (id: string, type: EPostSpotType) => () => {
      dispatch(
        openModal({ id: "delete-calendar-post-modal", data: { id, type } }),
      );
    },
    [],
  );

  const handleOpenEditEventModal = useCallback(
    (event: TCalendarEvent) => () => {
      dispatch(
        openModal({
          id: "edit-calendar-post-modal",
          data: event,
        }),
      );
    },
    [],
  );

  if (!event) {
    return null;
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="mt- flex items-center justify-between">
          Slot Details
          <div className="space-x-2">
            <Button
              size={"icon"}
              variant="outline"
              onClick={handleOpenEditEventModal(event)}
            >
              <Iconify
                icon="solar:pen-bold-duotone"
                className="flex-none"
                fontSize={18}
              />
            </Button>
            <Button
              size={"icon"}
              variant="outline"
              onClick={handleOpenDeleteEventModal(event.id, event.type)}
            >
              <Iconify
                icon="solar:trash-bin-2-bold-duotone"
                className="flex-none"
                fontSize={18}
              />
            </Button>
          </div>
        </SheetTitle>
      </SheetHeader>
      <div className="space-y-2">
        <div className="flex items-center gap-5">
          <p className="font-medium">Type:</p>
          <div className="flex items-center gap-1">
            <Iconify icon={getEventIcon(event.type)} fontSize={24} />
            <span>{getTypeName(event.type)}</span>
          </div>
        </div>
        {event.title && (
          <div className="flex items-center gap-5">
            <p className="font-medium">Title:</p>
            <p>{event.title}</p>
          </div>
        )}
        <div className="flex items-center gap-5">
          <p className="font-medium">Date / Time:</p>
          {event.type === EPostSpotType.Recurring ? (
            <p>
              {event.days
                .map((day) => {
                  const dayName = DAYS_OF_WEEK.find((d) => d.value === day);
                  return dayName?.label;
                })
                .join(", ")}{" "}
              {format(new Date(event.start), "p")}
            </p>
          ) : (
            <p>
              {format(new Date(event.start), "PPP") +
                " " +
                format(new Date(event.start), "p")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-5">
          <p className="font-medium">Socials:</p>
          <div className="flex items-center gap-2">
            {event.forTwitter && (
              <Iconify
                icon="simple-icons:x"
                className="flex-none"
                fontSize={20}
              />
            )}
            {event.forLinkedIn && (
              <Iconify
                icon="simple-icons:linkedin"
                className="flex-none"
                fontSize={20}
              />
            )}
          </div>
        </div>

        {postId && postId !== DEFAULT_POST_ID && (
          <>
            <h1 className="text-lg font-semibold">Post preview:</h1>
            {isPostLoading ? (
              <div className="flex h-56 items-center justify-center">
                <Spinner />
              </div>
            ) : isPostSuccess ? (
              <Tabs
                defaultValue={previewSocial}
                className="my-3 w-full"
                onValueChange={(value) => setPreviewSocial(value)}
              >
                <div className="flex items-center gap-2">
                  <TabsList className="flex w-full gap-2">
                    {postData.data.onTwitter && (
                      <TabsTrigger value="twitter" className="flex-1">
                        Twitter
                      </TabsTrigger>
                    )}{" "}
                    {postData.data.onLinkedIn && (
                      <TabsTrigger value="linkedin">Linkedin</TabsTrigger>
                    )}
                  </TabsList>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      push(ROUTES.post.edit(postId));
                    }}
                  >
                    <Iconify
                      icon="solar:pen-bold-duotone"
                      className="flex-none"
                      fontSize={18}
                    />
                  </Button>
                </div>

                {postData.data.onTwitter && (
                  <TabsContent value="twitter">
                    <div className="space-y-2 divide-y">
                      {postData.data.posts.map((post) => (
                        <div key={post.index}>
                          <div className="my-3 flex items-center gap-2 ">
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
                          <div className="space-y-2">
                            <p>{post.text}</p>
                            <div className="mb-2 flex items-center gap-2">
                              {post.imageLinks.map((image, index) => (
                                <div
                                  key={index}
                                  className="group relative w-fit overflow-hidden rounded"
                                >
                                  <Image
                                    src={image}
                                    alt={index.toString()}
                                    width={110}
                                    height={110}
                                    className="rounded object-cover"
                                  />
                                </div>
                              ))}
                              {post.gifLink && (
                                <div className="group relative w-fit overflow-hidden rounded">
                                  <Image
                                    src={post.gifLink}
                                    alt="gif"
                                    width={110}
                                    height={110}
                                    className="rounded object-cover"
                                  />
                                </div>
                              )}

                              {post.poll && (
                                <div className="space-y-2">
                                  <p className="font-medium">Poll:</p>
                                  <div className="ml-2 space-y-1">
                                    {post.poll.options.map((option, index) => (
                                      <p>
                                        {index + 1}. {option}
                                      </p>
                                    ))}
                                  </div>
                                  <p>
                                    Duration in minutes:{" "}
                                    {post.poll.durationMins}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}
                {postData.data.onTwitter && (
                  <TabsContent value="linkedin">
                    <div className="space-y-2 divide-y">
                      <div>
                        <div className="my-3 flex items-center gap-2 ">
                          <Avatar>
                            <AvatarImage
                              src={
                                session.data?.user.accounts.find(
                                  (account) =>
                                    account.accountType === EProviders.Linkedin,
                                )?.photoUrl ??
                                session.data?.user.profilePicture ??
                                ""
                              }
                              alt={`@${session.data?.user.accounts.find(
                                (account) =>
                                  account.accountType === EProviders.Linkedin,
                              )?.username}`}
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
                        <div className="space-y-2">
                          <p className="whitespace-pre-wrap">
                            {postData.data.posts
                              .map((post) => post.text)
                              .join("\n")}
                          </p>
                          <div className="mb-2 flex w-full flex-wrap items-center gap-2">
                            {postData.data.posts
                              .map((post) => post.imageLinks)
                              .flat()
                              .slice(0, 20)
                              .map((image, index) => (
                                <div
                                  key={index}
                                  className="group relative w-fit overflow-hidden rounded"
                                >
                                  <Image
                                    src={image}
                                    alt={index.toString()}
                                    width={100}
                                    height={100}
                                    className="rounded object-cover"
                                  />
                                </div>
                              ))}
                            {postData.data.posts
                              .filter((post) => Boolean(post.gifLink))
                              .map((post) => post.gifLink)
                              .filter((gifLink) => Boolean(gifLink))
                              .slice(0, 20)
                              .map((gif, index) => (
                                <div
                                  key={index}
                                  className="group relative w-fit overflow-hidden rounded"
                                >
                                  <Image
                                    src={gif!}
                                    alt="gif"
                                    width={110}
                                    height={110}
                                    className="rounded object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <ErrorCard
                title="Error while fetching post"
                refetchFunction={refetchPostData}
              />
            )}
          </>
        )}
      </div>
    </SheetContent>
  );
}
