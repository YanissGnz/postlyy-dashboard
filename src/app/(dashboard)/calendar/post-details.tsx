import Iconify from "@/components/ui/icon";
import { getIcon, getTypeName } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { EPostSpotType } from "@/types/EPostSpotType";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { format } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { DAYS_OF_WEEK } from "./add-edit-event-form";
import { useGetScheduledPostByIdQuery } from "@/redux/api/post/apiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import ErrorCard from "@/components/error-card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/routes";

const DEFAULT_POST_ID = "00000000-0000-0000-0000-00000000000";

export default function PostDetails() {
  const { list } = useAppSelector((state) => state.modals);
  const { currentAccount } = useAppSelector((state) => state.auth);
  const session = useSession();

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
    if (postData?.data.onTwitter && postData?.data.onLinkedIn) {
      setPreviewSocial("twitter");
    } else if (postData?.data.onTwitter) {
      setPreviewSocial("twitter");
    } else if (postData?.data.onLinkedIn) {
      setPreviewSocial("linkedin");
    }
  }, [postData?.data.onLinkedIn, postData?.data.onTwitter]);

  const event: TCalendarEvent | null = useMemo(() => {
    const found = list.find(
      (modal) => modal.id === "calendar-post-details-modal",
    );
    if (found) {
      return found.data as TCalendarEvent;
    }
    return null;
  }, [list]);

  if (!event) {
    return <div>Event Not Found</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-5">
        <p className="font-medium">Type:</p>
        <div className="flex items-center gap-1">
          <Iconify icon={getIcon(event.type)} fontSize={24} />
          <span>{getTypeName(event.type)}</span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <p className="font-medium">Title:</p>
        <p>{event.title}</p>
      </div>
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

      <h1>Post preview:</h1>
      {isPostLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner />
        </div>
      ) : isPostSuccess ? (
        <div className="">
          <div className="mb-5 mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {postData.data.onTwitter && (
                <Button
                  className="p-2"
                  variant={previewSocial === "twitter" ? "default" : "outline"}
                  onClick={() => setPreviewSocial("twitter")}
                >
                  <Iconify
                    icon="simple-icons:x"
                    className="mr-1"
                    fontSize={20}
                  />
                  X (Twitter)
                </Button>
              )}
              {postData.data.onLinkedIn && (
                <Button
                  className="p-2"
                  variant={previewSocial === "linkedin" ? "default" : "outline"}
                  onClick={() => setPreviewSocial("linkedin")}
                >
                  <Iconify
                    icon="simple-icons:linkedin"
                    className="mr-1"
                    fontSize={20}
                  />
                  LinkedIn
                </Button>
              )}
            </div>
            <Button size="icon" variant="ghost">
              <Link href={ROUTES.post.edit(postId!)}>
                <Iconify
                  icon="solar:pen-bold-duotone"
                  className="mr-1"
                  fontSize={20}
                />
              </Link>
            </Button>
          </div>
          {previewSocial === "twitter" && (
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
                        {currentAccount?.username?.slice(0, 2).toUpperCase() ??
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
                          <p>Duration in minutes: {post.poll.durationMins}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {previewSocial === "linkedin" && (
            <div className="space-y-2 divide-y">
              <div>
                <div className="my-3 flex items-center gap-2 ">
                  <Avatar>
                    <AvatarImage
                      src={
                        session.data?.user.accounts.find(
                          (account) => account.accountType === 1,
                        )?.photoUrl ??
                        session.data?.user.profilePicture ??
                        ""
                      }
                      alt={`@${session.data?.user.accounts.find(
                        (account) => account.accountType === 1,
                      )?.username}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {currentAccount?.username?.slice(0, 2).toUpperCase() ??
                        session.data?.user.fullName?.slice(0, 2).toUpperCase()}
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
                    {postData.data.posts.map((post) => post.text).join("\n")}
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
          )}
        </div>
      ) : (
        <ErrorCard
          title="Error while fetching post"
          refetchFunction={refetchPostData}
        />
      )}
    </div>
  );
}
