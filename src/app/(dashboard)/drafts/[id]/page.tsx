"use client";

import ErrorCard from "@/components/error-card";
import LoadingCard from "@/components/loading-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { useAuth } from "@/lib/auth/client";
import { useGetDraftByIdQuery } from "@/redux/api/post/apiSlice";
import { EProviders } from "@/types/EProviders";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function page({ params: { id } }: { params: { id: string } }) {
  const {
    data: draftData,
    isLoading: isLoadingDraft,
    isSuccess,
    refetch,
  } = useGetDraftByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  const { data: session } = useAuth();

  const accounts = useMemo(() => {
    return session?.accounts ?? [];
  }, [session?.accounts]);

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
          <Tabs
            defaultValue={previewSocial}
            className="my-3 w-full"
            onValueChange={(value) => setPreviewSocial(value)}
          >
            <TabsList className="flex w-full gap-2">
              {draftData.data.onTwitter && (
                <TabsTrigger value="twitter" className="flex-1">
                  Twitter
                </TabsTrigger>
              )}{" "}
              {draftData.data.onLinkedIn && (
                <TabsTrigger value="linkedin" className="flex-1">
                  Linkedin
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="twitter">
              <div className="space-y-2 divide-y">
                {draftData.data.posts.map((post) => (
                  <div key={post.index}>
                    <div className="my-3 flex items-center gap-2 ">
                      <Avatar>
                        <AvatarImage
                          src={
                            getAccount(EProviders.Twitter)
                              ? getAccount(EProviders.Twitter)?.photoUrl
                              : session?.profilePicture ?? ""
                          }
                          alt={`@${getAccount(EProviders.Twitter)?.username}`}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {getAccount(EProviders.Twitter)
                            ?.username?.slice(0, 2)
                            .toUpperCase() ??
                            session?.fullName?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">
                          {session?.fullName}
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
            </TabsContent>
            <TabsContent value="linkedin">
              <div className="space-y-2 divide-y">
                <div>
                  <div className="my-3 flex items-center gap-2 ">
                    <Avatar>
                      <AvatarImage
                        src={
                          session?.accounts?.find(
                            (account: { accountType: EProviders }) =>
                              account.accountType === EProviders.Linkedin,
                          )?.photoUrl ??
                          session?.profilePicture ??
                          ""
                        }
                        alt={`@${session?.accounts?.find(
                          (account: { accountType: EProviders }) =>
                            account.accountType === EProviders.Linkedin,
                        )?.username}`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getAccount(0)?.username?.slice(0, 2).toUpperCase() ??
                          session?.fullName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">
                        {session?.fullName}
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
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <ErrorCard title="Draft not found" refetchFunction={refetch} />
      )}
    </>
  );
}
