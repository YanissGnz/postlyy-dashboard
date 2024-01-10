/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

import { useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { type TPostForm, postFormSchema } from "@/types/TPostForm";
import {
  type EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
  type Theme,
} from "emoji-picker-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import ImageUploading, { type ImageListType } from "react-images-uploading";
import Image from "@/components/ui/image";
import { toast } from "sonner";
import { fData } from "@/lib/formatNumber";
import { env } from "@/env";
import { type TenorImage } from "gif-picker-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  {
    ssr: false,
    loading(loadingProps) {
      if (loadingProps.error) {
        return (
          <div
            className="flex items-center justify-center"
            style={{
              height: "400px",
              width: "300px",
            }}
          >
            <p>Error!</p>
          </div>
        );
      }

      return (
        <div
          className="flex items-center justify-center"
          style={{
            height: "400px",
            width: "300px",
          }}
        >
          <Spinner />
        </div>
      );
    },
  },
);

const GifPicker = dynamic(
  () => {
    return import("gif-picker-react");
  },
  {
    ssr: false,
    loading(loadingProps) {
      if (loadingProps.error) {
        return (
          <div
            className="flex items-center justify-center"
            style={{
              height: "400px",
              width: "300px",
            }}
          >
            <p>Error!</p>
          </div>
        );
      }

      return (
        <div
          className="flex items-center justify-center"
          style={{
            height: "400px",
            width: "300px",
          }}
        >
          <Spinner />
        </div>
      );
    },
  },
);

const MAX_IMAGES = 4;
const ACCEPTED_IMAGE_TYPES = ["jpg", "png"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function PostPage() {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const session = useSession();
  const { theme, systemTheme } = useTheme();

  const [selectedSocial, setSelectedSocial] = useState(
    currentAccount?.accountType ?? 0,
  );
  const [openedGifPopupIndex, setOpenedGifPopupIndex] = useState<number | null>(
    null,
  );
  const [postsContent, setPostsContent] = useState<
    {
      index: number;
      images: ImageListType;
      gif?: string;
      poll?: {
        durationMins: number;
        options: string[];
      };
    }[]
  >([
    {
      index: 0,
      images: [],
    },
  ]);

  const hasAccount = useCallback(
    (accountType: number) => {
      return Boolean(
        session.data?.user.accounts.find(
          (account) => account.accountType === accountType,
        ),
      );
    },
    [session.data?.user.accounts],
  );

  const selectedAccount = useMemo(() => {
    return session.data?.user.accounts.find(
      (account) => account.accountType === selectedSocial,
    );
  }, [selectedSocial, session]);

  const getPostContent = useCallback(
    (index: number) => {
      return postsContent.find((postImages) => postImages.index === index);
    },
    [postsContent],
  );

  const defaultValues: TPostForm = useMemo(() => {
    return {
      asEvergreen: false,
      isDraft: false,
      onLinkedIn: selectedAccount?.accountType === 1,
      onTwitter: selectedAccount?.accountType === 0,
      ScheduleDate: new Date().toISOString(),
      posts: [
        {
          index: 0,
          text: "",
          gif: "",
          images: [],
          poll: null,
          twitterDirectLink: false,
        },
      ],
    };
  }, [selectedAccount]);

  const form = useForm<TPostForm>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (currentAccount) {
      form.reset(defaultValues);
    }
  }, [currentAccount]);

  const handleAddThread = useCallback(
    (index: number) => () => {
      const newThread = {
        index,
        text: "",
        gif: "",
        images: [],
        poll: null,
        twitterDirectLink: false,
      };

      const newThreads = [
        ...form.getValues("posts").slice(0, index + 1),
        newThread,
        ...form.getValues("posts").slice(index + 1),
      ];

      form.setValue(
        "posts",
        newThreads.map((thread, i) => ({ ...thread, index: i })),
      );

      setPostsContent((prev) =>
        [
          ...prev.slice(0, index + 1),
          {
            index,
            images: [],
          },
          ...prev.slice(index + 1),
        ].map((post, i) => ({ ...post, index: i })),
      );
    },
    [form],
  );

  const handleDeleteThread = useCallback(
    (index: number) => () => {
      const newThreads = form.getValues("posts").filter((_, i) => i !== index);

      setPostsContent((prev) =>
        prev
          .filter((_, i) => i !== index)
          .map((post, i) => ({ ...post, index: i })),
      );

      form.setValue(
        "posts",
        newThreads.map((thread, i) => ({ ...thread, index: i })),
      );
    },
    [form],
  );

  const handleInsetEmoji = useCallback(
    (index: number) => (emoji: EmojiClickData) => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            text: thread.text + emoji.emoji,
          };
        }

        return thread;
      });

      form.setValue("posts", newThreads);
    },
    [],
  );

  const onImagesUpload = useCallback(
    (index: number) => (imageList: ImageListType) => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            images: imageList.map((image) => image.dataURL ?? ""),
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              images: imageList,
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
    },
    [form],
  );

  const onImageRemove = useCallback(
    (imageIndex: number, postIndex: number) => () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === postIndex) {
          return {
            ...thread,
            images: thread.images.filter((_, i) => i !== imageIndex),
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === postIndex) {
            return {
              ...post,
              images: post.images.filter((_, i) => i !== imageIndex),
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
    },
    [form],
  );

  const handleAddGif = useCallback(
    (index: number) => (gif: TenorImage) => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            gif: gif.url,
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              gif: gif.url,
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
      setOpenedGifPopupIndex(null);
    },
    [form],
  );

  const handleRemoveGif = useCallback(
    (index: number) => () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            gif: "",
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              gif: "",
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
    },
    [form],
  );

  const handleAddPoll = useCallback(
    (index: number) => async () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            poll: {
              durationMins: 0,
              options: ["", ""],
            },
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              poll: {
                durationMins: 0,
                options: ["", ""],
              },
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
      await form.trigger("posts");
    },
    [form],
  );

  const handleDeletePoll = useCallback(
    (index: number) => async () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
          return {
            ...thread,
            poll: null,
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              poll: undefined,
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
      await form.trigger("posts");
    },
    [form],
  );

  const handleDeletePollOption = useCallback(
    (postIndex: number, optionIndex: number) => async () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === postIndex) {
          return {
            ...thread,
            poll: {
              durationMins: thread.poll?.durationMins ?? 0,
              options:
                thread.poll?.options.filter((_, i) => i !== optionIndex) ?? [],
            },
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === postIndex) {
            return {
              ...post,
              poll: {
                durationMins: post.poll?.durationMins ?? 0,
                options:
                  post.poll?.options.filter((_, i) => i !== optionIndex) ?? [],
              },
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
      await form.trigger("posts");
    },
    [form],
  );

  const handleAddPollOption = useCallback(
    (postIndex: number) => async () => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === postIndex) {
          if (Number(thread.poll?.options.length) < 4)
            return {
              ...thread,
              poll: {
                durationMins: thread.poll?.durationMins ?? 0,
                options: [...(thread.poll?.options ?? []), ""],
              },
            };
          return thread;
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === postIndex) {
            return {
              ...post,
              poll: {
                durationMins: post.poll?.durationMins ?? 0,
                options: [...(post.poll?.options ?? []), ""],
              },
            };
          }

          return post;
        });

        return newPostsImages;
      });

      form.setValue("posts", newThreads);
      await form.trigger("posts");
    },
    [form],
  );

  return (
    <TooltipProvider>
      <Card>
        <Form {...form}>
          <CardContent className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between border-b py-4">
              <div className="flex items-center gap-3">
                {form.getValues("onTwitter") && (
                  <Button
                    variant={selectedSocial === 0 ? "default" : "outline"}
                    onClick={() => setSelectedSocial(0)}
                  >
                    <Iconify
                      icon="simple-icons:x"
                      className="mr-1"
                      fontSize={18}
                    />
                    X (Twitter)
                  </Button>
                )}
                {form.getValues("onLinkedIn") && (
                  <Button
                    variant={selectedSocial === 1 ? "default" : "outline"}
                    onClick={() => setSelectedSocial(1)}
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
              <Tooltip>
                <TooltipTrigger>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" type="button" variant="ghost">
                        <Iconify
                          icon="solar:tuning-2-bold-duotone"
                          fontSize={26}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`onTwitter`}
                        render={({ field }) => (
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="onTwitter"
                                disabled={
                                  !hasAccount(0) ||
                                  (!form.getValues("onLinkedIn") && field.value)
                                }
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />{" "}
                              <Label htmlFor="onTwitter">X (Twitter)</Label>
                            </div>
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`onLinkedIn`}
                        render={({ field }) => (
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="onLinkedIn"
                                disabled={
                                  !hasAccount(0) ||
                                  (!form.getValues("onTwitter") && field.value)
                                }
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />{" "}
                              <Label htmlFor="onLinkedIn">LinkedIn</Label>
                            </div>
                          </FormControl>
                        )}
                      />
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-center">Socials</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div>
              <div>
                <ScrollArea className="h-[400px] w-full">
                  <div className="px-1">
                    {form.getValues("posts").map((post) => (
                      <Fragment key={post.index}>
                        <div className="my-3 flex items-center gap-2 ">
                          <Avatar>
                            <AvatarImage
                              src={
                                selectedAccount?.photoUrl
                                  ? selectedAccount?.photoUrl
                                  : session.data?.user.profilePicture ?? ""
                              }
                              alt={`@${selectedAccount?.username}`}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {selectedAccount?.username
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
                              @{selectedAccount?.username}
                            </p>
                          </div>
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name={`posts.${post.index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    className="mb-4 min-h-[60px] w-full"
                                    placeholder={
                                      post.index === 0
                                        ? "What's up?"
                                        : `Thread ${post.index + 1}`
                                    }
                                    {...field}
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="mb-2 flex items-center gap-2">
                            {getPostContent(post.index)?.images &&
                              postsContent
                                .find(
                                  (postImages) =>
                                    postImages.index === post.index,
                                )
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
                                    <div className="absolute right-0 top-0 hidden p-1 group-hover:block">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Button
                                            variant="destructive"
                                            size="icon"
                                            type="button"
                                            onClick={onImageRemove(
                                              index,
                                              post.index,
                                            )}
                                          >
                                            <Iconify
                                              icon="solar:trash-bin-2-bold-duotone"
                                              className="text-destructive-foreground"
                                              fontSize={16}
                                            />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="bottom"
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          <p>Delete image</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                ))}
                            {Boolean(getPostContent(post.index)?.gif) && (
                              <div className="group relative w-fit overflow-hidden rounded">
                                <Image
                                  src={post.gif}
                                  alt="gif"
                                  width={110}
                                  height={110}
                                  className="rounded object-cover"
                                />

                                <div className="absolute right-0 top-0 hidden p-1 group-hover:block">
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        type="button"
                                        onClick={handleRemoveGif(post.index)}
                                      >
                                        <Iconify
                                          icon="solar:trash-bin-2-bold-duotone"
                                          className="text-destructive-foreground"
                                          fontSize={16}
                                        />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="bottom"
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      <p>Delete gif</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            )}

                            {Boolean(getPostContent(post.index)?.poll) && (
                              <div className="space-y-2">
                                <p className="font-medium">Poll:</p>
                                {post.poll?.options.map((option, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-1 items-center gap-1"
                                  >
                                    <FormField
                                      control={form.control}
                                      name={`posts.${post.index}.poll.options.${index}`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder={`Option ${
                                                index + 1
                                              }`}
                                              className="w-full"
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />

                                    {index < 3 &&
                                      Number(post.poll?.options.length) ===
                                        index + 1 && (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              type="button"
                                              onClick={handleAddPollOption(
                                                post.index,
                                              )}
                                            >
                                              <Iconify
                                                icon="solar:add-circle-bold-duotone"
                                                fontSize={18}
                                              />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent side="bottom">
                                            <p>Add option</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}

                                    {index >= 2 && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            onClick={handleDeletePollOption(
                                              post.index,
                                              index,
                                            )}
                                          >
                                            <Iconify
                                              icon="solar:trash-bin-2-bold-duotone"
                                              className="text-destructive"
                                              fontSize={16}
                                            />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="bottom"
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          <p>Delete option</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={handleDeletePoll(post.index)}
                                >
                                  <Iconify
                                    icon="solar:trash-bin-2-bold-duotone"
                                    className="mr-2"
                                    fontSize={16}
                                  />
                                  Remove poll
                                </Button>
                              </div>
                            )}
                          </div>
                          <div
                            className={cn(
                              "flex items-center justify-between border-t pt-1",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {form.getValues("posts").length > 1 && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      size="icon"
                                      onClick={handleDeleteThread(post.index)}
                                    >
                                      <Iconify
                                        icon="solar:minus-circle-bold-duotone"
                                        className="text-destructive"
                                        fontSize={24}
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    <p>Delete thread {post.index + 1}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                    onClick={handleAddThread(post.index + 1)}
                                  >
                                    <Iconify
                                      icon="solar:add-circle-bold-duotone"
                                      fontSize={26}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Add a thread</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            <div className={cn("flex items-center gap-2")}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div>
                                    <ImageUploading
                                      multiple
                                      onChange={onImagesUpload(post.index)}
                                      maxNumber={MAX_IMAGES}
                                      value={
                                        getPostContent(post.index)?.images ?? []
                                      }
                                      acceptType={ACCEPTED_IMAGE_TYPES}
                                      maxFileSize={MAX_FILE_SIZE}
                                      onError={(errors) => {
                                        if (errors?.maxFileSize) {
                                          toast.error(
                                            `File size is too big. Max file size is ${fData(
                                              MAX_FILE_SIZE,
                                            )}MB`,
                                          );
                                        } else if (errors?.acceptType) {
                                          toast.error(
                                            `File type is not supported. Supported file types are ${ACCEPTED_IMAGE_TYPES.join(
                                              ", ",
                                            )}`,
                                          );
                                        } else if (errors?.maxNumber) {
                                          toast.error(
                                            `You can only upload ${MAX_IMAGES} images`,
                                          );
                                        }
                                      }}
                                    >
                                      {({ onImageUpload, imageList }) => (
                                        <div className="upload__image-wrapper">
                                          <Button
                                            size="icon"
                                            type="button"
                                            variant="ghost"
                                            onClick={onImageUpload}
                                            disabled={
                                              imageList.length >= MAX_IMAGES ||
                                              Boolean(post.gif)
                                            }
                                          >
                                            <Iconify
                                              icon="solar:gallery-minimalistic-bold-duotone"
                                              fontSize={28}
                                            />
                                          </Button>
                                        </div>
                                      )}
                                    </ImageUploading>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className={cn(
                                    Boolean(getPostContent(post.index)?.gif) ||
                                      Boolean(post.poll) ||
                                      ((
                                        getPostContent(post.index)?.images ?? []
                                      ).length === 4 &&
                                        "bg-destructive text-destructive-foreground"),
                                  )}
                                >
                                  <p className="text-center">
                                    {Boolean(getPostContent(post.index)?.gif) ||
                                    Boolean(post.poll) ? (
                                      `You can only add a gif or ${MAX_IMAGES} images or a poll`
                                    ) : (
                                        getPostContent(post.index)?.images ?? []
                                      ).length < 4 ? (
                                      <>
                                        Add photos
                                        <br /> (Up to 4 photos, 15MB each)
                                      </>
                                    ) : (
                                      <>You can only add up to 4 photos</>
                                    )}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Popover
                                    open={openedGifPopupIndex === post.index}
                                    onOpenChange={(open) => {
                                      if (!open) setOpenedGifPopupIndex(null);
                                      else setOpenedGifPopupIndex(post.index);
                                    }}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="icon"
                                        type="button"
                                        variant="ghost"
                                        disabled={
                                          (
                                            getPostContent(post.index)
                                              ?.images ?? []
                                          ).length > 0
                                        }
                                      >
                                        <Iconify
                                          icon="material-symbols:gif-box-rounded"
                                          className="text-[#818282]"
                                          fontSize={28}
                                        />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" side="left">
                                      <GifPicker
                                        tenorApiKey={
                                          env.NEXT_PUBLIC_TENOR_API_KEY
                                        }
                                        theme={
                                          theme === "system"
                                            ? (systemTheme as Theme)
                                            : (theme as Theme)
                                        }
                                        height={400}
                                        width={300}
                                        onGifClick={handleAddGif(post.index)}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className={cn(
                                    Boolean(getPostContent(post.index)?.gif) ||
                                      Boolean(post.poll) ||
                                      ((
                                        getPostContent(post.index)?.images ?? []
                                      ).length > 0 &&
                                        "bg-destructive text-destructive-foreground"),
                                  )}
                                >
                                  <p className="text-center">
                                    {(getPostContent(post.index)?.images ?? [])
                                      .length > 0 || Boolean(post.poll) ? (
                                      `You can only add a gif or ${MAX_IMAGES} images or a poll`
                                    ) : Boolean(post.gif) ? (
                                      <>Change GIF</>
                                    ) : (
                                      "Add a GIF"
                                    )}{" "}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                    onClick={handleAddPoll(post.index)}
                                    disabled={
                                      (getPostContent(post.index)?.images ?? [])
                                        .length > 0 ||
                                      Boolean(post.gif) ||
                                      Boolean(post.poll)
                                    }
                                  >
                                    <Iconify
                                      icon="solar:chart-square-bold-duotone"
                                      fontSize={26}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className={cn(
                                    Boolean(getPostContent(post.index)?.gif) ||
                                      Boolean(post.poll) ||
                                      ((
                                        getPostContent(post.index)?.images ?? []
                                      ).length > 0 &&
                                        "bg-destructive text-destructive-foreground"),
                                  )}
                                >
                                  <p className="text-center">
                                    {(getPostContent(post.index)?.images ?? [])
                                      .length > 0 ||
                                    Boolean(post.gif) ||
                                    Boolean(post.poll)
                                      ? `You can only add a gif or ${MAX_IMAGES} images or a poll`
                                      : "Add a poll"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="icon"
                                        type="button"
                                        variant="ghost"
                                      >
                                        <Iconify
                                          icon="solar:emoji-funny-square-bold-duotone"
                                          fontSize={26}
                                        />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" side="left">
                                      <EmojiPicker
                                        onEmojiClick={handleInsetEmoji(
                                          post.index,
                                        )}
                                        skinTonePickerLocation={
                                          SkinTonePickerLocation.PREVIEW
                                        }
                                        emojiStyle={EmojiStyle.TWITTER}
                                        height={400}
                                        width={300}
                                        className="w-full bg-background"
                                        theme={
                                          theme === "system"
                                            ? (systemTheme as Theme)
                                            : (theme as Theme)
                                        }
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-center">Choose an emoji</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        size="icon"
                                        type="button"
                                        variant="ghost"
                                      >
                                        <Iconify
                                          icon="solar:menu-dots-square-bold-duotone"
                                          fontSize={26}
                                        />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      side="bottom"
                                      className="space-y-3"
                                    >
                                      <FormField
                                        control={form.control}
                                        name={`posts.${post.index}.twitterDirectLink`}
                                        render={({ field }) => (
                                          <FormControl>
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id={`posts.${post.index}.twitterDirectLink`}
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />{" "}
                                              <Label
                                                htmlFor={`posts.${post.index}.twitterDirectLink`}
                                              >
                                                Add a "DM me" Button
                                              </Label>
                                            </div>
                                          </FormControl>
                                        )}
                                      />
                                      {post.index === 0 && (
                                        <FormField
                                          control={form.control}
                                          name={`asEvergreen`}
                                          render={({ field }) => (
                                            <FormControl>
                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id="asEvergreen"
                                                  checked={field.value}
                                                  onCheckedChange={
                                                    field.onChange
                                                  }
                                                />{" "}
                                                <Label htmlFor="asEvergreen">
                                                  Set as evergreen
                                                </Label>
                                              </div>
                                            </FormControl>
                                          )}
                                        />
                                      )}
                                    </PopoverContent>
                                  </Popover>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-center">More options</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline">
                    Save as drafts
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!form.formState.isValid}
                    >
                      Pick a time
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!form.formState.isValid}
                    >
                      Post now
                    </Button>
                    <Button type="button" disabled={!form.formState.isValid}>
                      Add to queue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Form>
      </Card>
    </TooltipProvider>
  );
}
