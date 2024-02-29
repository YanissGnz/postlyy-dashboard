"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGetDraftByIdQuery } from "@/redux/api/post/apiSlice";
import LoadingCard from "@/components/loading-card";
import ErrorCard from "@/components/error-card";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { env } from "@/env";
import { EProviders } from "@/types/EProviders";

export default function page({ params: { id } }: { params: { id: string } }) {
  const {
    data: draftData,
    isLoading: isLoadingDraft,
    isSuccess,
    refetch,
  } = useGetDraftByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  const { data } = useSession();

  const accounts = useMemo(() => {
    return data?.user.accounts ?? [];
  }, [data?.user.accounts]);

  const getAccount = useCallback(
    (type: EProviders) => {
      return accounts.find((account) => account.accountType === type);
    },
    [accounts],
  );

  const [previewSocial, setPreviewSocial] = useState(
    draftData?.data.onTwitter ? "twitter" : "linkedin",
  );

  useEffect(() => {
    if (draftData?.data.onTwitter && draftData?.data.onLinkedIn) {
      setPreviewSocial("twitter");
    } else if (draftData?.data.onTwitter) {
      setPreviewSocial("twitter");
    } else if (draftData?.data.onLinkedIn) {
      setPreviewSocial("linkedin");
    }
  }, [draftData?.data.onLinkedIn, draftData?.data.onTwitter]);

  return (
    <>
      {isLoadingDraft ? (
        <LoadingCard />
      ) : isSuccess ? (
        <div className="space-y-2 px-4 py-4 md:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Draft preview</h2>
          </div>
          <div className="">
            <div className="mb-5 mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {draftData.data.onTwitter && (
                  <Button
                    className="p-2"
                    variant={
                      previewSocial === "twitter" ? "default" : "outline"
                    }
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
                {draftData.data.onLinkedIn && (
                  <Button
                    className="p-2"
                    variant={
                      previewSocial === "linkedin" ? "default" : "outline"
                    }
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
            </div>
            {previewSocial === "twitter" && (
              <div className="space-y-2 divide-y">
                {draftData.data.posts.map((post) => (
                  <div key={post.index}>
                    <div className="my-3 flex items-center gap-2 ">
                      <Avatar>
                        <AvatarImage
                          src={
                            getAccount(EProviders.Twitter)
                              ? getAccount(EProviders.Twitter)?.photoUrl
                              : data?.user.profilePicture ?? ""
                          }
                          alt={`@${getAccount(EProviders.Twitter)?.username}`}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {getAccount(EProviders.Twitter)
                            ?.username?.slice(0, 2)
                            .toUpperCase() ??
                            data?.user.fullName?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">
                          {data?.user.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          @
                          {getAccount(0)
                            ?.username.toLowerCase()
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
                              src={`${env.NEXT_PUBLIC_API_BASE_URL}/${image}`}
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
                              src={`${env.NEXT_PUBLIC_API_BASE_URL}/${post.gifLink}`}
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
                          data?.user.accounts.find(
                            (account) =>
                              account.accountType === EProviders.Linkedin,
                          )?.photoUrl ??
                          data?.user.profilePicture ??
                          ""
                        }
                        alt={`@${data?.user.accounts.find(
                          (account) =>
                            account.accountType === EProviders.Linkedin,
                        )?.username}`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getAccount(0)?.username?.slice(0, 2).toUpperCase() ??
                          data?.user.fullName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">
                        {data?.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        @
                        {getAccount(0)
                          ?.username.toLowerCase()
                          .split(" ")
                          .join("")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">
                      {draftData.data.posts.map((post) => post.text).join("\n")}
                    </p>
                    <div className="mb-2 flex w-full flex-wrap items-center gap-2">
                      {draftData.data.posts
                        .map((post) => post.imageLinks)
                        .flat()
                        .slice(0, 20)
                        .map((image, index) => (
                          <div
                            key={index}
                            className="group relative w-fit overflow-hidden rounded"
                          >
                            <Image
                              src={`${env.NEXT_PUBLIC_API_BASE_URL}/${image}`}
                              alt={index.toString()}
                              width={100}
                              height={100}
                              className="rounded object-cover"
                            />
                          </div>
                        ))}
                      {draftData.data.posts
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
                              src={`${env.NEXT_PUBLIC_API_BASE_URL}/${gif}`}
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
        </div>
      ) : (
        <ErrorCard title="Draft not found" refetchFunction={refetch} />
      )}
    </>
  );
}
