"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import Image from "@/components/ui/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppSelector } from "@/redux/hooks";
import { EProviders } from "@/types/EProviders";
import { type TPostForm } from "@/types/TPostForm";
import { useSession } from "next-auth/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { type UseFormReturn } from "react-hook-form";
import { type ImageListType } from "react-images-uploading";

type Props = {
  isPreviewSheetOpen: boolean;
  setIsPreviewSheetOpen: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<TPostForm, unknown, undefined>;
  getPostContent: (index: number) =>
    | {
        index: number;
        images: ImageListType;
        gif?: string | null | undefined;
        poll?:
          | {
              durationMins: number;
              options: string[];
            }
          | undefined;
      }
    | undefined;
  postsContent: {
    index: number;
    images: ImageListType;
    gif?: string | null | undefined;
    poll?:
      | {
          durationMins: number;
          options: string[];
        }
      | undefined;
  }[];
};

export default function PreviewSheet({
  isPreviewSheetOpen,
  setIsPreviewSheetOpen,
  form,
  getPostContent,
  postsContent,
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
        <div className="">
          <div className="mb-5 mt-5 flex items-center gap-2">
            {form.getValues("onTwitter") && (
              <Button
                className="p-2"
                variant={previewSocial === "twitter" ? "default" : "outline"}
                onClick={() => setPreviewSocial("twitter")}
              >
                <Iconify icon="simple-icons:x" className="mr-1" fontSize={20} />
                X (Twitter)
              </Button>
            )}
            {form.getValues("onLinkedIn") && (
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
          {previewSocial === "twitter" && (
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
                      {getPostContent(post.index)?.images &&
                        postsContent
                          .find((postImages) => postImages.index === post.index)
                          ?.images.map((image, index) => (
                            <div
                              key={index}
                              className="group relative w-fit overflow-hidden rounded"
                            >
                              <Image
                                src={image.dataURL}
                                alt={index.toString()}
                                width={110}
                                height={110}
                                className="rounded object-cover"
                              />
                            </div>
                          ))}
                      {Boolean(getPostContent(post.index)?.gif) && (
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
          )}
          {previewSocial === "linkedin" && (
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
                    {form
                      .getValues("posts")
                      .map((post) => post.text)
                      .join("\n")}
                  </p>
                  <div className="mb-2 flex w-full flex-wrap items-center gap-2">
                    {postsContent
                      .map((post) => post.images)
                      .flat()
                      .slice(0, 20)
                      .map((image, index) => (
                        <div
                          key={index}
                          className="group relative w-fit overflow-hidden rounded"
                        >
                          <Image
                            src={image.dataURL}
                            alt={index.toString()}
                            width={100}
                            height={100}
                            className="rounded object-cover"
                          />
                        </div>
                      ))}
                    {postsContent
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
      </SheetContent>
    </Sheet>
  );
}
