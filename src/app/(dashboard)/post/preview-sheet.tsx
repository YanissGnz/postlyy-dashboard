"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "@/components/ui/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/hooks";
import { EProviders } from "@/types/EProviders";
import { type TPostForm } from "@/types/TPostForm";
import { useSession } from "next-auth/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { type UseFormReturn } from "react-hook-form";

type Props = {
  isPreviewSheetOpen: boolean;
  setIsPreviewSheetOpen: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<TPostForm, unknown, undefined>;
};

export default function PreviewSheet({
  isPreviewSheetOpen,
  setIsPreviewSheetOpen,
  form,
}: Props) {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const session = useSession();
  const [previewSocial, setPreviewSocial] = useState(
    form.getValues("onTwitter") ? "twitter" : "linkedin",
  );

  return (
    <Sheet
      open={isPreviewSheetOpen}
      onOpenChange={(open) => setIsPreviewSheetOpen(open)}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Preview</SheetTitle>
        </SheetHeader>
        <Tabs
          defaultValue={previewSocial}
          className="my-3 w-full"
          onValueChange={(value) => setPreviewSocial(value)}
        >
          <TabsList className="flex w-full gap-2">
            {form.getValues("onTwitter") && (
              <TabsTrigger value="twitter" className="flex-1">
                Twitter
              </TabsTrigger>
            )}{" "}
            {form.getValues("onLinkedIn") && (
              <TabsTrigger value="linkedin" className="flex-1">
                Linkedin
              </TabsTrigger>
            )}
          </TabsList>
          {form.getValues("onTwitter") && (
            <TabsContent value="twitter">
              <div className="space-y-2 divide-y">
                {form.getValues("posts").map((post) => (
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
                        {post.images?.map((image, index) => (
                          <div
                            key={index}
                            className="group relative w-fit overflow-hidden rounded"
                          >
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={index.toString()}
                              width={110}
                              height={110}
                              className="rounded object-cover"
                            />
                          </div>
                        ))}
                        {Boolean(post.gif) && (
                          <div className="group relative w-fit overflow-hidden rounded">
                            <Image
                              src={post.gif as string}
                              alt="gif"
                              width={110}
                              height={110}
                              className="rounded object-cover"
                            />
                          </div>
                        )}

                        {form.getValues(`posts.${post.index}.poll`) && (
                          <div className="space-y-2">
                            <p className="font-medium">Poll:</p>
                            <div className="ml-2 space-y-1">
                              {form
                                .getValues(`posts.${post.index}.poll`)
                                ?.options.map((option, index) => (
                                  <p>
                                    {index + 1}. {option}
                                  </p>
                                ))}
                            </div>
                            <p>
                              Duration in minutes:{" "}
                              {
                                form.getValues(`posts.${post.index}.poll`)
                                  ?.durationMins
                              }
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
          {form.getValues("onLinkedIn") && (
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
                    <p className="whitespace-pre-wrap">
                      {form
                        .getValues("posts")
                        .map((post) => post.text)
                        .join("\n")}
                    </p>
                    <div className="mb-2 flex w-full flex-wrap items-center gap-2">
                      {form
                        .getValues("posts")
                        .map((post) => post.images)
                        .flat()
                        .slice(0, 20)
                        .map((image, index) => (
                          <div
                            key={index}
                            className="group relative w-fit overflow-hidden rounded"
                          >
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={index.toString()}
                              width={100}
                              height={100}
                              className="rounded object-cover"
                            />
                          </div>
                        ))}
                      {form
                        .getValues("posts")
                        .filter((post) => Boolean(post.gif))
                        .map((post) => post.gif)
                        .filter((gif) => Boolean(gif))
                        .slice(0, 20)
                        .map((gif, index) => (
                          <div
                            key={index}
                            className="group relative w-fit overflow-hidden rounded"
                          >
                            <Image
                              src={gif as string}
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
      </SheetContent>
    </Sheet>
  );
}
