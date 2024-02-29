/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import {
  type ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

import { useAppSelector } from "@/redux/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CardContent } from "@/components/ui/card";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";
import { type TPostForm, postFormSchema, type TPost } from "@/types/TPostForm";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  useDeleteDraftImageMutation,
  useGetScheduledPostByIdQuery,
  useUpdateScheduledPostMutation,
} from "@/redux/api/post/apiSlice";
import { useBoolean, useMediaQuery } from "usehooks-ts";
import PreviewSheet from "./preview-sheet";
import { LAYOUT } from "@/lib/constants";
import ErrorCard from "@/components/error-card";
import { type TErrorResponse } from "@/types/TErrorResponse";
import { isArray } from "lodash";
import { EProviders } from "@/types/EProviders";
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

const TWITTER_MAX_IMAGES = 4;
const LINKEDIN_MAX_IMAGES = 20;
const ACCEPTED_IMAGE_TYPES = ["jpg", "png"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const TWITTER_TEXT_MAX_LENGTH = 280;

const generateFormData = async (data: TPostForm) => {
  const formData = new FormData();

  formData.append("AsEvergreen", data.asEvergreen ? "true" : "false");
  formData.append("OnLinkedIn", data.onLinkedIn ? "true" : "false");
  formData.append("OnTwitter", data.onTwitter ? "true" : "false");

  data.posts.forEach(async (post, index) => {
    formData.append(`Posts[${index}].index`, post.index.toString());
    formData.append(`Posts[${index}].text`, post.text);
    formData.append(
      `Posts[${index}].twitterDirectLink`,
      post.twitterDirectLink ? "true" : "false",
    );
    if (post.gif) {
      formData.append(`Posts[${index}].gif`, post.gif);
    }

    if (post.gifLink) {
      formData.append(`Posts[${index}].gif`, post.gifLink);
    }

    post.images.forEach((image) => {
      formData.append(`Posts[${index}].images`, image);
    });
    if (post.poll) {
      formData.append(
        `Posts[${index}].poll.DurationMins`,
        post.poll.durationMins.toString(),
      );
      post.poll.options.forEach((option, i) => {
        formData.append(`Posts[${index}].poll.Options${i}`, option);
      });
    }
  });

  return formData;
};

type Props = {
  params: {
    id: string;
  };
};

export default function EditPostPage({ params: { id: postId } }: Props) {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { isCollapsed } = useAppSelector((state) => state.layout);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const session = useSession();
  const { theme, systemTheme } = useTheme();

  const {
    data: postData,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
    refetch: refetchPostData,
  } = useGetScheduledPostByIdQuery(postId, {
    skip: !postId,
    refetchOnMountOrArgChange: true,
  });

  const [updatePost, { isLoading: isUpdatingPost }] =
    useUpdateScheduledPostMutation();
  const [deleteDraftImage] = useDeleteDraftImageMutation();

  const [openedGifPopupIndex, setOpenedGifPopupIndex] = useState<number | null>(
    null,
  );
  const [postsContent, setPostsContent] = useState<
    {
      index: number;
      images: ImageListType;
      imageLinks?: string[];
      gifLink?: string;
      gif?: string | null;
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

  const { value: isPreviewSheetOpen, setValue: setIsPreviewSheetOpen } =
    useBoolean(false);

  const hasAccount = useCallback(
    (accountType: EProviders) => {
      return Boolean(
        session.data?.user.accounts.find(
          (account) => account.accountType === accountType,
        ),
      );
    },
    [session.data?.user.accounts],
  );

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
      onLinkedIn: currentAccount?.accountType === EProviders.Linkedin,
      onTwitter: currentAccount?.accountType === EProviders.Twitter,
      scheduleDate: new Date().toISOString(),
      isTemplate: false,
      addFinisher: false,
      posts: [
        {
          index: 0,
          text: "",
          gif: null,
          images: [],
          poll: null,
          twitterDirectLink: false,
          imageLinks: [],
          gifLink: "",
        },
      ],
    };
  }, [currentAccount]);

  const form = useForm<TPostForm>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (currentAccount) {
      form.reset(defaultValues);
      setPostsContent([
        {
          index: 0,
          images: [],
        },
      ]);
    }
  }, [currentAccount]);

  function processThread(thread: TPost): TPost[] {
    if (thread.text.length > TWITTER_TEXT_MAX_LENGTH) {
      const remainingText = thread.text.slice(TWITTER_TEXT_MAX_LENGTH);
      const newThread: TPost = {
        index: 0,
        text: remainingText.slice(0, TWITTER_TEXT_MAX_LENGTH),
        gif: null,
        images: [],
        poll: null,
        twitterDirectLink: false,
        gifLink: "",
        imageLinks: [],
      };
      return [
        { ...thread, text: thread.text.slice(0, TWITTER_TEXT_MAX_LENGTH) },
        newThread,
      ].concat(processThread(newThread));
    } else return [thread];
  }

  useEffect(() => {
    if (form.getValues("onTwitter")) {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === 0) {
          return {
            ...thread,
            images: thread.images.slice(0, TWITTER_MAX_IMAGES),
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === 0) {
            return {
              ...post,
              images: post.images.slice(0, TWITTER_MAX_IMAGES),
            };
          }

          return post;
        });

        return newPostsImages;
      });

      const finalThreads = newThreads
        .map((thread) => processThread(thread))
        .flat();

      form.setValue(
        "posts",
        finalThreads.map((thread, index) => ({ ...thread, index })),
      );
    }
  }, [form.getValues("onTwitter")]);

  useEffect(() => {
    if (isPostSuccess) {
      const newPosts = postData?.data.posts.map((post) => ({
        ...post,
        pull: post.poll ?? null,
        imageLinks: post.imageLinks ?? [],
        gif: post.gifLink ?? null,
        images: [],
      }));

      const newForm: TPostForm = {
        addFinisher: postData?.data.addFinisher,
        asEvergreen: postData?.data.asEvergreen,
        isDraft: postData?.data.isDraft,
        isTemplate: postData?.data.isTemplate,
        onLinkedIn: postData?.data.onLinkedIn,
        onTwitter: postData?.data.onTwitter,
        scheduleDate: postData?.data.scheduleDate ?? "",
        posts: newPosts ?? [],
      };
      postFormSchema
        .parseAsync(newForm)
        .then((data) => {
          form.reset(data);
        })
        .catch((err) => {
          console.log("🚀 ~ .then ~ err:", err);
          form.reset(defaultValues);
          setPostsContent([
            {
              index: 0,
              images: [],
            },
          ]);
          setPostsContent([
            {
              index: 0,
              images: [],
            },
          ]);
        });
    }
  }, [isPostSuccess, isPostLoading]);

  const handleTextChange = useCallback(
    (index: number) => (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value.slice(0, 280);
      const extraText = e.target.value.slice(280);

      if (
        extraText.length > 0 &&
        index === form.getValues("posts").length - 1
      ) {
        const newThread = {
          index: index + 1,
          text: extraText,
          gif: null,
          images: [],
          poll: null,
          twitterDirectLink: false,
          gifLink: "",
          imageLinks: [],
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
      } else {
        const newThreads = form.getValues("posts").map((thread, i) => {
          if (i === index) {
            return {
              ...thread,
              text,
            };
          }

          return thread;
        });

        form.setValue("posts", newThreads);

        void (async () => {
          await form.trigger("posts");
        })();
      }
    },
    [form],
  );

  const handleAddThread = useCallback(
    (index: number) => () => {
      const newThread = {
        index,
        text: "",
        gif: null,
        images: [],
        poll: null,
        twitterDirectLink: false,
        gifLink: "",
        imageLinks: [],
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
            images: imageList.map((image) => image.file!),
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

  const onImageLinkRemove = useCallback(
    (imageIndex: number, postIndex: number) => async () => {
      const image =
        form.getValues("posts")[postIndex]?.imageLinks?.[imageIndex];

      if (!image) return;
      await deleteDraftImage({
        id: postId,
        url: image,
      })
        .unwrap()
        .then(() => {
          const newThreads = form.getValues("posts").map((thread, i) => {
            if (i === postIndex) {
              return {
                ...thread,
                imageLinks: thread.imageLinks.filter(
                  (_, i) => i !== imageIndex,
                ),
              };
            }

            return thread;
          });

          setPostsContent((prev) => {
            const newPostsImages = prev.map((post) => {
              if (post.index === postIndex) {
                return {
                  ...post,
                  imageLinks:
                    post.imageLinks?.filter((_, i) => i !== imageIndex) ?? [],
                };
              }

              return post;
            });

            return newPostsImages;
          });

          form.setValue("posts", newThreads);
        });
    },
    [form],
  );

  const handleAddGif = useCallback(
    (index: number) => (gif: TenorImage) => {
      const newThreads = form.getValues("posts").map((thread, i) => {
        if (i === index) {
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
          return {
            ...thread,
            gif: gif.url,
          };
        }

        return thread;
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
            gif: null,
          };
        }

        return thread;
      });

      setPostsContent((prev) => {
        const newPostsImages = prev.map((post) => {
          if (post.index === index) {
            return {
              ...post,
              gif: null,
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

  // Posting

  const handleUpdatePost = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    const data = await generateFormData(form.getValues());
    form.getValues("posts").forEach((post, index) => {
      data.append(`Posts[${index}].id`, postId);
    });
    const addToQueuePromise = updatePost({
      body: data,
      id: postId,
    }).unwrap();
    toast.promise(addToQueuePromise, {
      loading: "Updating post...",
      success: async () => {
        await refetchPostData();
        return "Post updated successfully";
      },
      error: (err: TErrorResponse | string) => {
        if (isArray(err)) return err[0];
        return "Something went wrong";
      },
    });
  }, [form]);

  return (
    <>
      {isPostLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner />
        </div>
      ) : isPostSuccess ? (
        <>
          <TooltipProvider>
            <div>
              <Form {...form}>
                <CardContent className="mx-auto max-w-5xl">
                  <div className="space-y-2 border-b py-4">
                    <div className="flex items-center justify-between ">
                      <div className="flex items-center gap-3">
                        {form.getValues("onTwitter") && (
                          <Badge className="p-2" variant="outline">
                            <Iconify
                              icon="simple-icons:x"
                              className="mr-1"
                              fontSize={20}
                            />
                            X (Twitter)
                          </Badge>
                        )}
                        {form.getValues("onLinkedIn") && (
                          <Badge className="p-2" variant="outline">
                            <Iconify
                              icon="simple-icons:linkedin"
                              className="mr-1"
                              fontSize={20}
                            />
                            LinkedIn
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
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
                                    icon="solar:tuning-2-bold-duotone"
                                    className="text-foreground/80"
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
                                  name={`onTwitter`}
                                  render={({ field }) => (
                                    <FormControl>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="onTwitter"
                                          disabled={
                                            !hasAccount(EProviders.Linkedin) ||
                                            (!form.getValues("onLinkedIn") &&
                                              field.value)
                                          }
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />{" "}
                                        <Label htmlFor="onTwitter">
                                          X (Twitter)
                                        </Label>
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
                                            !hasAccount(EProviders.Twitter) ||
                                            (!form.getValues("onTwitter") &&
                                              field.value)
                                          }
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />{" "}
                                        <Label htmlFor="onLinkedIn">
                                          LinkedIn
                                        </Label>
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
                        </Tooltip>{" "}
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              size="icon"
                              type="button"
                              variant="ghost"
                              onClick={() => setIsPreviewSheetOpen(true)}
                            >
                              <Iconify
                                icon="solar:eye-bold-duotone"
                                className="text-foreground/80"
                                fontSize={26}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-center">Preview</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {form.getValues("onLinkedIn") && (
                      <p>
                        <Alert>
                          <InfoCircledIcon className="h-4 w-4" />
                          <AlertTitle>Note</AlertTitle>
                          <AlertDescription>
                            All threads and images (up to 20) will be posted as
                            a single post on LinkedIn
                            <br /> (Polls are not supported on LinkedIn)
                          </AlertDescription>
                        </Alert>
                      </p>
                    )}
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
                                      currentAccount?.photoUrl
                                        ? currentAccount?.photoUrl
                                        : session.data?.user.profilePicture ??
                                          ""
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
                                          onChange={
                                            form.getValues("onTwitter")
                                              ? handleTextChange(post.index)
                                              : field.onChange
                                          }
                                        />
                                      </FormControl>
                                      {form.getValues("onTwitter") && (
                                        <FormDescription>
                                          {field.value.length}/
                                          {TWITTER_TEXT_MAX_LENGTH}
                                        </FormDescription>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="mb-2 flex w-full flex-wrap items-center gap-2">
                                  {form
                                    .getValues(`posts.${post.index}.imageLinks`)
                                    .map((image, index) => (
                                      <div
                                        key={index}
                                        className="group relative w-fit overflow-hidden rounded"
                                      >
                                        <Image
                                          src={`${env.NEXT_PUBLIC_API_BASE_URL}/${image}`}
                                          alt={image}
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
                                                onClick={onImageLinkRemove(
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
                                        src={
                                          getPostContent(post.index)?.gif ?? ""
                                        }
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
                                              onClick={handleRemoveGif(
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
                                            <p>Delete gif</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  )}

                                  {Boolean(
                                    getPostContent(post.index)?.poll,
                                  ) && (
                                    <div className="space-y-2">
                                      <p className="font-medium">Poll:</p>
                                      {post.poll?.options.map(
                                        (option, index) => (
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
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                            {index < 3 &&
                                              Number(
                                                post.poll?.options.length,
                                              ) ===
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
                                                        className="text-foreground/80"
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
                                        ),
                                      )}
                                      <FormField
                                        control={form.control}
                                        name={`posts.${post.index}.poll.durationMins`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Poll duration in minutes
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                type="number"
                                                placeholder="Poll duration in minutes (0 for no duration)"
                                                className="w-full"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={handleDeletePoll(post.index)}
                                      >
                                        <Iconify
                                          icon="solar:trash-bin-2-bold-duotone"
                                          className="mr-2 text-foreground/80"
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
                                            onClick={handleDeleteThread(
                                              post.index,
                                            )}
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
                                          onClick={handleAddThread(
                                            post.index + 1,
                                          )}
                                        >
                                          <Iconify
                                            icon="solar:add-circle-bold-duotone"
                                            className="text-foreground/80"
                                            fontSize={26}
                                          />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom">
                                        <p>Add a thread</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>

                                  <div
                                    className={cn("flex items-center gap-2")}
                                  >
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div>
                                          <ImageUploading
                                            multiple
                                            onChange={onImagesUpload(
                                              post.index,
                                            )}
                                            maxNumber={
                                              form.getValues("onTwitter")
                                                ? TWITTER_MAX_IMAGES
                                                : LINKEDIN_MAX_IMAGES
                                            }
                                            value={
                                              getPostContent(post.index)
                                                ?.images ?? []
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
                                                  `You can only upload ${
                                                    form.getValues("onTwitter")
                                                      ? TWITTER_MAX_IMAGES
                                                      : LINKEDIN_MAX_IMAGES
                                                  } images`,
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
                                                    imageList.length >=
                                                      (form.getValues(
                                                        "onTwitter",
                                                      )
                                                        ? TWITTER_MAX_IMAGES
                                                        : LINKEDIN_MAX_IMAGES) ||
                                                    Boolean(post.gif)
                                                  }
                                                >
                                                  <Iconify
                                                    icon="solar:gallery-minimalistic-bold-duotone"
                                                    className="text-foreground/80"
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
                                          Boolean(
                                            getPostContent(post.index)?.gif,
                                          ) ||
                                            Boolean(post.poll) ||
                                            ((
                                              getPostContent(post.index)
                                                ?.images ?? []
                                            ).length === 4 &&
                                              "bg-destructive text-destructive-foreground"),
                                        )}
                                      >
                                        <p className="text-center">
                                          {Boolean(
                                            getPostContent(post.index)?.gif,
                                          ) || Boolean(post.poll) ? (
                                            `You can only add a gif or ${
                                              form.getValues("onTwitter")
                                                ? TWITTER_MAX_IMAGES
                                                : LINKEDIN_MAX_IMAGES
                                            } images or a poll`
                                          ) : (
                                              getPostContent(post.index)
                                                ?.images ?? []
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
                                          open={
                                            openedGifPopupIndex === post.index
                                          }
                                          onOpenChange={(open) => {
                                            if (!open)
                                              setOpenedGifPopupIndex(null);
                                            else
                                              setOpenedGifPopupIndex(
                                                post.index,
                                              );
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
                                          <PopoverContent
                                            className="p-0"
                                            side="left"
                                          >
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
                                              onGifClick={handleAddGif(
                                                post.index,
                                              )}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="bottom"
                                        className={cn(
                                          Boolean(
                                            getPostContent(post.index)?.gif,
                                          ) ||
                                            Boolean(post.poll) ||
                                            ((
                                              getPostContent(post.index)
                                                ?.images ?? []
                                            ).length > 0 &&
                                              "bg-destructive text-destructive-foreground"),
                                        )}
                                      >
                                        <p className="text-center">
                                          {(
                                            getPostContent(post.index)
                                              ?.images ?? []
                                          ).length > 0 || Boolean(post.poll) ? (
                                            `You can only add a gif or ${
                                              form.getValues("onTwitter")
                                                ? TWITTER_MAX_IMAGES
                                                : LINKEDIN_MAX_IMAGES
                                            } images or a poll`
                                          ) : Boolean(post.gif) ? (
                                            <>Change GIF</>
                                          ) : (
                                            "Add a GIF"
                                          )}{" "}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                    {form.getValues("onTwitter") && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Button
                                            size="icon"
                                            type="button"
                                            variant="ghost"
                                            onClick={handleAddPoll(post.index)}
                                            disabled={
                                              (
                                                getPostContent(post.index)
                                                  ?.images ?? []
                                              ).length > 0 ||
                                              Boolean(post.gif) ||
                                              Boolean(post.poll)
                                            }
                                          >
                                            <Iconify
                                              icon="solar:chart-square-bold-duotone"
                                              className="text-foreground/80"
                                              fontSize={26}
                                            />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="bottom"
                                          className={cn(
                                            Boolean(
                                              getPostContent(post.index)?.gif,
                                            ) ||
                                              Boolean(post.poll) ||
                                              ((
                                                getPostContent(post.index)
                                                  ?.images ?? []
                                              ).length > 0 &&
                                                "bg-destructive text-destructive-foreground"),
                                          )}
                                        >
                                          <p className="text-center">
                                            {(
                                              getPostContent(post.index)
                                                ?.images ?? []
                                            ).length > 0 ||
                                            Boolean(post.gif) ||
                                            Boolean(post.poll)
                                              ? `You can only add a gif or ${
                                                  form.getValues("onTwitter")
                                                    ? TWITTER_MAX_IMAGES
                                                    : LINKEDIN_MAX_IMAGES
                                                } images or a poll`
                                              : "Add a poll"}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
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
                                                className="text-foreground/80"
                                                fontSize={26}
                                              />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="p-0"
                                            side="left"
                                          >
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
                                        <p className="text-center">
                                          Choose an emoji
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
                                                icon="solar:menu-dots-square-bold-duotone"
                                                className="text-foreground/80"
                                                fontSize={26}
                                              />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            side="bottom"
                                            className="space-y-3"
                                          >
                                            {form.getValues("onTwitter") && (
                                              <FormField
                                                control={form.control}
                                                name={`posts.${post.index}.twitterDirectLink`}
                                                render={({ field }) => (
                                                  <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                      <Switch
                                                        id={`posts.${post.index}.twitterDirectLink`}
                                                        checked={field.value}
                                                        onCheckedChange={
                                                          field.onChange
                                                        }
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
                                            )}
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
                                            {post.index === 0 && (
                                              <FormField
                                                control={form.control}
                                                name={`addFinisher`}
                                                render={({ field }) => (
                                                  <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                      <Switch
                                                        id="addFinisher"
                                                        checked={field.value}
                                                        onCheckedChange={
                                                          field.onChange
                                                        }
                                                      />{" "}
                                                      <Label htmlFor="addFinisher">
                                                        Add finisher
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
                                        <p className="text-center">
                                          More options
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </ScrollArea>

                      <div
                        className="absolute bottom-0 right-0 flex items-center justify-between gap-2 overflow-auto bg-background p-2 transition-all duration-500"
                        style={{
                          left: isMobile
                            ? 0
                            : isCollapsed
                              ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
                              : LAYOUT.SIDEBAR_WIDTH,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            disabled={!form.formState.isValid || isUpdatingPost}
                            onClick={handleUpdatePost}
                          >
                            Update post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Form>
            </div>
          </TooltipProvider>
          <PreviewSheet
            isPreviewSheetOpen={isPreviewSheetOpen}
            setIsPreviewSheetOpen={setIsPreviewSheetOpen}
            form={form}
            postsContent={postsContent}
            getPostContent={getPostContent}
          />
        </>
      ) : (
        <ErrorCard
          title="Something went wrong"
          refetchFunction={refetchPostData}
        />
      )}
    </>
  );
}
