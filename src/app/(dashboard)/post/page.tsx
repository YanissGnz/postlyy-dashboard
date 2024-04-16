/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import BottomButtons from "@/components/bottom-buttons";
import { Spinner } from "@/components/ui/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Iconify from "@/components/ui/icon";
import Image from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env";
import { fData } from "@/lib/formatNumber";
import { cn, convertToUTC, hasAccount } from "@/lib/utils";
import {
  calendarApiUtil,
  useGetNextFiveSpotsQuery,
  useGetRecurringSpotsQuery,
} from "@/redux/api/calendar/apiSlice";
import {
  useAddPostNowMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
  useDeleteDraftImageMutation,
  useGetBestPostByIdMutation,
  useGetDraftMutation,
  useGetTemplateMutation,
  useUpdateDraftMutation,
} from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EProviders } from "@/types/EProviders";
import { postFormSchema, type TPost, type TPostForm } from "@/types/TPostForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import {
  EmojiStyle,
  SkinTonePickerLocation,
  type EmojiClickData,
  type Theme,
} from "emoji-picker-react";
import { type TenorImage } from "gif-picker-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useForm } from "react-hook-form";
import ImageUploading, { type ImageListType } from "react-images-uploading";
import { toast } from "sonner";
import { useBoolean, useMediaQuery } from "usehooks-ts";
import { DAYS_OF_WEEK } from "../calendar/add-edit-event-form";
import BestPostsSheet from "./best-posts-sheet";
import DraftSheet from "./draft-sheet";
import Note from "./note";
import NotesSheet from "./notes-sheet";
import PreviewSheet from "./preview-sheet";
import TemplateSheet from "./template-sheet";
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
        (post.poll.durationMins * 60).toString(),
      );
      post.poll.options.forEach((option, i) => {
        formData.append(`Posts[${index}].poll.Options[${i}]`, option);
      });
    }
  });

  return formData;
};

export default function PostPage() {
  const session = useSession();

  const { currentAccount } = useAppSelector((state) => state.auth);

  const accounts = useMemo(
    () => session.data?.user.accounts ?? [],
    [session.data],
  );

  const { theme, systemTheme } = useTheme();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const searchParams = useSearchParams();

  const withInspiration = searchParams?.get("inspiration") === "true";

  const {
    data: recurringSpots,
    isLoading: isRecurringSpotsLoading,
    isSuccess: isRecurringSpotSuccess,
  } = useGetRecurringSpotsQuery();

  const [postNowOrSchedule, { isLoading: isPostingNowOrScheduling }] =
    useAddPostNowMutation();
  const [addPostToSpot, { isLoading: isAddingPostToSpot }] =
    useAddPostToSpotMutation();
  const [addRecurringPost, { isLoading: isAddingRecurringPost }] =
    useAddRecurringPostMutation();

  const [getDraft] = useGetDraftMutation();
  const [getBestPost] = useGetBestPostByIdMutation();
  const [updatedDraft] = useUpdateDraftMutation();
  const [getTemplate] = useGetTemplateMutation();
  const [deleteDraftImage] = useDeleteDraftImageMutation();

  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);

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

  const { value: isScheduleDialogOpen, setValue: setIsScheduleDialogOpen } =
    useBoolean(false);
  const { value: isDraftDialogOpen, setValue: setIsDraftDialogOpen } =
    useBoolean(false);
  const { value: isDraftSheetOpen, setValue: setIsDraftSheetOpen } =
    useBoolean(false);
  const { value: isBestPostsSheetOpen, setValue: setIsBestPostsSheetOpen } =
    useBoolean(false);
  const { value: isTemplateSheetOpen, setValue: setIsTemplateSheetOpen } =
    useBoolean(false);
  const { value: isNotesSheetOpen, setValue: setIsNotesSheetOpen } =
    useBoolean(false);
  const { value: isPreviewSheetOpen, setValue: setIsPreviewSheetOpen } =
    useBoolean(false);
  const { value: isQueueDialogOpen, setValue: setIsQueueDialogOpen } =
    useBoolean(false);
  const { value: isRecurringDialogOpen, setValue: setIsRecurringDialogOpen } =
    useBoolean(false);

  const [selectedSpots, setSelectedSpots] = useState<
    Array<{
      id: string;
      provider: EProviders;
    }>
  >([]);
  const [scheduleDate, setScheduleDate] = useState("");

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
      onLinkedIn: accounts.some(
        (account) => account.accountType === EProviders.Linkedin,
      ),
      onTwitter: accounts.some(
        (account) => account.accountType === EProviders.Twitter,
      ),
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
    mode: "all",
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const {
    data: nextSpots,
    isLoading: isSpotsLoading,
    isSuccess,
  } = useGetNextFiveSpotsQuery(
    {
      providers: [
        ...(form.getValues("onLinkedIn") ? [EProviders.Linkedin] : []),
        ...(form.getValues("onTwitter") ? [EProviders.Twitter] : []),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

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

  const splitText = useCallback((text: string, i: number): string[] => {
    if (text.length > TWITTER_TEXT_MAX_LENGTH) {
      const remainingText = text.slice(TWITTER_TEXT_MAX_LENGTH);

      const newTexts: string[] = [
        text.slice(0, TWITTER_TEXT_MAX_LENGTH),

        ...splitText(remainingText, i + 1),
      ];
      return newTexts;
    } else return [text];
  }, []);

  const handleTextChange = useCallback(
    (index: number) => (e: ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;

      if (text.length > TWITTER_TEXT_MAX_LENGTH) {
        const newTexts = splitText(text, index);

        const newThreads = newTexts.map((text, i) => ({
          index: index + i,
          text,
          gif: null,
          images: [],
          poll: null,
          twitterDirectLink: false,
          gifLink: "",
          imageLinks: [],
        }));
        void new Promise((resolve) => {
          form.setValue(
            "posts",
            [
              ...form.getValues("posts").slice(0, index),
              ...newThreads,
              ...form.getValues("posts").slice(index + 1),
            ].map((thread, i) => ({ ...thread, index: i })),
          );

          setPostsContent((prev) =>
            [
              ...prev.slice(0, index),
              ...newThreads.map((thread, i) => ({
                index: index + i,
                images: [],
              })),
              ...prev.slice(index + 1),
            ].map((post, i) => ({ ...post, index: i })),
          );
          resolve(null);
        }).then(() => {
          form.setFocus(`posts.${index + 1}.text`, {
            shouldSelect: true,
          });
        });
      } else {
        form.setValue(`posts.${index}.text`, text);
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
    (imageIndex: number, postIndex: number) => () => {
      const image =
        form.getValues("posts")[postIndex]?.imageLinks?.[imageIndex];

      if (!image) return;

      if (!selectedDraftId) {
        const newThreads = form.getValues("posts").map((thread, i) => {
          if (i === postIndex) {
            return {
              ...thread,
              imageLinks: thread.imageLinks.filter((_, i) => i !== imageIndex),
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
      } else {
        const deleteImagePromise = deleteDraftImage({
          id: selectedDraftId,
          url: image,
        }).unwrap();

        toast.promise(deleteImagePromise, {
          loading: "Deleting image...",
          success: () => {
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
            return "Deleted image!";
          },
          error: "Something went wrong",
        });
      }
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
    },
    [form],
  );

  const handleCustomDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedSpots([]);
      setScheduleDate(e.target.value);
    },
    [],
  );

  useEffect(() => {
    if (withInspiration) {
      const inspiration = localStorage.getItem("inspiration");

      if (inspiration) {
        const promise = new Promise<TPost[]>((resolve) => {
          const texts = splitText(inspiration, 0);

          const newThreads = texts.map((text, i) => ({
            index: i,
            text,
            gif: null,
            images: [],
            poll: null,
            twitterDirectLink: false,
            gifLink: "",
            imageLinks: [],
          }));

          resolve(newThreads);
        });

        toast.promise(promise, {
          loading: "Adding inspiration...",
          success: (newThreads) => {
            form.setValue(`posts`, newThreads);
            return "Added inspiration!";
          },
          error: "Something went wrong",
        });
      }
    }
  }, [withInspiration, form]);

  // Posting

  const handlePostNow = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    await generateFormData(form.getValues()).then((data) => {
      const postNowPromise = postNowOrSchedule(data).unwrap();
      toast.promise(postNowPromise, {
        loading: "Posting...",
        success: () => {
          form.reset(defaultValues);
          setPostsContent([
            {
              index: 0,
              images: [],
            },
          ]);

          return "Posted!";
        },
        error: "Something went wrong",
      });
    });
  }, [form]);

  const handleSchedulePost = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    const data = await generateFormData(form.getValues());
    if (scheduleDate !== "") {
      setIsScheduleDialogOpen(false);
      setIsQueueDialogOpen(false);
      data.append("ScheduleDate", convertToUTC(scheduleDate));

      const schedulePostPromise = postNowOrSchedule(data).unwrap();
      toast.promise(schedulePostPromise, {
        loading: "Scheduling post...",
        success: () => {
          form.reset(defaultValues);
          setPostsContent([
            {
              index: 0,
              images: [],
            },
          ]);
          setScheduleDate("");
          return "Scheduled post!";
        },
        error: "Something went wrong",
      });
    } else if (selectedSpots.length > 0) {
      setIsScheduleDialogOpen(false);
      setIsQueueDialogOpen(false);

      selectedSpots.forEach(async (spot) => {
        if (spot.provider === EProviders.Linkedin) {
          data.append("onLinkedIn", "true");
          data.delete("onTwitter");
        } else {
          data.append("onTwitter", "true");
          data.delete("onLinkedIn");
        }

        const schedulePostPromise = addPostToSpot({
          body: data,
          spotId: spot.id,
        }).unwrap();
        toast.promise(schedulePostPromise, {
          loading: "Scheduling post...",
          success: () => {
            form.reset(defaultValues);
            setPostsContent([
              {
                index: 0,
                images: [],
              },
            ]);
            setScheduleDate("");
            return "Scheduled post!";
          },
          error: "Something went wrong",
        });
      });
    } else {
      toast.error("Please select a date or a spot");
    }
    setScheduleDate("");
    calendarApiUtil.invalidateTags(["Events", "Spot"]);
  }, [scheduleDate, selectedSpots, form]);

  const handleAddRecurringPost = useCallback(async () => {
    if (!selectedSpots) return;
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    setIsRecurringDialogOpen(false);

    const data = await generateFormData(form.getValues());

    selectedSpots.forEach(async (spot) => {
      const addRecurringPostPromise = addRecurringPost({
        body: data,
        recurringId: spot.id,
      }).unwrap();
      toast.promise(addRecurringPostPromise, {
        loading: "Adding recurring post...",
        success: () => {
          setSelectedSpots([]);
          form.reset(defaultValues);
          setPostsContent([
            {
              index: 0,
              images: [],
            },
          ]);

          return "Added recurring post!";
        },
        error: "Something went wrong",
      });

      calendarApiUtil.invalidateTags(["Events", "Recurring"]);
    });
  }, [selectedSpots, form]);

  // Draft
  const handleSaveDraft = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    setIsDraftDialogOpen(false);

    const data = await generateFormData(form.getValues());

    data.append("isDraft", "true");
    data.append("isTemplate", "false");
    data.append(
      "ScheduleDate",
      scheduleDate
        ? convertToUTC(scheduleDate)
        : convertToUTC(addDays(new Date(), 7).toISOString()),
    );

    const saveDraftPromise = postNowOrSchedule(data).unwrap();
    toast.promise(saveDraftPromise, {
      loading: "Saving draft...",
      success: () => {
        form.reset(defaultValues);
        setPostsContent([
          {
            index: 0,
            images: [],
          },
        ]);
        setScheduleDate("");
        return "Saved draft!";
      },
      error: "Something went wrong",
    });

    setScheduleDate("");
  }, [scheduleDate]);

  const handleUpdateDraft = useCallback(async () => {
    if (!selectedDraftId) return;
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    setIsDraftDialogOpen(false);

    const data = await generateFormData(form.getValues());

    data.append("isDraft", "true");
    data.append("isTemplate", "false");
    data.append(
      "ScheduleDate",
      scheduleDate
        ? convertToUTC(scheduleDate)
        : convertToUTC(form.getValues("scheduleDate")),
    );

    form.getValues("posts").forEach((post, index) => {
      data.append(`Posts[${index}].id`, selectedDraftId);
    });

    const updateDraftPromise = updatedDraft({
      body: data,
      id: selectedDraftId,
    }).unwrap();
    toast.promise(updateDraftPromise, {
      loading: "Updating draft...",
      success: () => {
        form.reset(defaultValues);
        setPostsContent([
          {
            index: 0,
            images: [],
          },
        ]);

        setScheduleDate("");
        setSelectedDraftId(null);
        return "Updated draft!";
      },
      error: "Something went wrong",
    });
  }, [scheduleDate, selectedDraftId]);

  const handleEditDraft = useCallback(async (id: string) => {
    const getDraftPromise = getDraft(id).unwrap();

    setSelectedDraftId(id);
    toast.promise(getDraftPromise, {
      loading: "Fetching draft...",
      success: async (data) => {
        const newPosts = data.data.posts.map((post) => ({
          ...post,
          pull: post.poll ?? null,
          images: post.images ?? [],
          imageLinks: post.imageLinks ?? [],
          gif: post.gifLink ?? null,
        }));

        const newForm: TPostForm = {
          addFinisher: data.data.addFinisher,
          asEvergreen: data.data.asEvergreen,
          isDraft: data.data.isDraft,
          isTemplate: data.data.isTemplate,
          onLinkedIn: form.getValues("onLinkedIn"),
          onTwitter: form.getValues("onTwitter"),
          scheduleDate: data.data.scheduleDate,
          posts: newPosts,
        };
        postFormSchema
          .parseAsync(newForm)
          .then((data) => {
            form.reset(data);
            setIsDraftSheetOpen(false);
          })
          .catch(() => {
            toast.error("Failed to fetch draft");

            setIsDraftSheetOpen(false);
          });
        return "Fetched draft!";
      },
      error: "Failed to fetch draft",
    });
  }, []);

  // Template
  const handleSaveTemplate = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    const data = await generateFormData(form.getValues());
    data.append("isTemplate", "true");
    data.append("isDraft", "false");

    const saveTemplatePromise = postNowOrSchedule(data).unwrap();
    toast.promise(saveTemplatePromise, {
      loading: "Saving template...",
      success: () => {
        form.reset(defaultValues);
        setPostsContent([
          {
            index: 0,
            images: [],
          },
        ]);
        return "Saved template!";
      },
      error: "Something went wrong",
    });
  }, []);

  const handleUseTemplate = useCallback((id: string) => {
    const getTemplatePromise = getTemplate(id).unwrap();

    toast.promise(getTemplatePromise, {
      loading: "Fetching template...",
      success: async (data) => {
        const newPosts = data.data.posts.map((post) => ({
          ...post,
          pull: post.poll ?? null,
          imageLinks: post.imageLinks ?? [],
          gif: post.gifLink ?? null,
          images: [],
        }));

        const newForm: TPostForm = {
          addFinisher: data.data.addFinisher,
          asEvergreen: data.data.asEvergreen,
          isDraft: data.data.isDraft,
          isTemplate: data.data.isTemplate,
          onLinkedIn: form.getValues("onLinkedIn"),
          onTwitter: form.getValues("onTwitter"),
          scheduleDate: data.data.scheduleDate ?? "",
          posts: newPosts,
        };
        postFormSchema
          .parseAsync(newForm)
          .then((data) => {
            form.reset(data);
            setPostsContent([
              {
                index: 0,
                images: [],
              },
            ]);
            setIsTemplateSheetOpen(false);
          })
          .catch(() => {
            toast.error("Failed to fetch template");

            setIsTemplateSheetOpen(false);
          });
        return "Fetched template!";
      },
      error: "Failed to fetch template",
    });
  }, []);

  // Note
  const handleOpenNote = useCallback((id: string) => {
    setNoteId(id);
    setIsNotesSheetOpen(false);
  }, []);

  const handleCloseNote = useCallback(() => {
    setNoteId(null);
  }, []);

  // Best Posts

  const handleUseBestPost = useCallback(
    (id: string) => {
      setIsBestPostsSheetOpen(false);
      const getBestPostPromise = getBestPost(id).unwrap();

      toast.promise(getBestPostPromise, {
        loading: "Fetching best post...",
        success: async (data) => {
          const newPosts = data.data.posts.map((post) => ({
            ...post,
            pull: post.poll ?? null,
            imageLinks: post.imageLinks ?? [],
            gif: post.gifLink ?? null,
            images: [],
          }));

          const newForm: TPostForm = {
            addFinisher: data.data.addFinisher,
            asEvergreen: data.data.asEvergreen,
            isDraft: data.data.isDraft,
            isTemplate: data.data.isTemplate,
            onLinkedIn: form.getValues("onLinkedIn"),
            onTwitter: form.getValues("onTwitter"),
            scheduleDate: data.data.scheduleDate ?? "",
            posts: newPosts,
          };

          postFormSchema
            .parseAsync(newForm)
            .then((data) => {
              form.reset(data);
            })
            .catch(() => {
              toast.error("Something went wrong");
            });

          return "Fetched best post!";
        },
        error: "Failed to fetch best post",
      });
    },
    [form],
  );

  return (
    <>
      <TooltipProvider>
        <div className="flex w-full flex-wrap md:flex-nowrap">
          <Form {...form}>
            <CardContent className="mx-auto max-w-5xl flex-1 transition-all">
              <div className="space-y-2 border-b py-4">
                <div className="flex items-center justify-between ">
                  <div
                    id="selected-socials"
                    className="flex items-center gap-3"
                  >
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
                              id="post-settings"
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Iconify
                                icon="solar:settings-bold-duotone"
                                className="text-foreground/80"
                                fontSize={26}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="bottom" className="space-y-3">
                            <div className="space-y-3">
                              <h6>Socials</h6>
                              {hasAccount(
                                EProviders.Twitter,
                                session.data?.user.accounts,
                              ) && (
                                <FormField
                                  control={form.control}
                                  name={`onTwitter`}
                                  render={({ field }) => (
                                    <FormControl>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="onTwitter"
                                          disabled={
                                            !hasAccount(
                                              EProviders.Linkedin,
                                              session.data?.user.accounts,
                                            ) ||
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
                              )}
                              {hasAccount(
                                EProviders.Linkedin,
                                session.data?.user.accounts,
                              ) && (
                                <FormField
                                  control={form.control}
                                  name={`onLinkedIn`}
                                  render={({ field }) => (
                                    <FormControl>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="onLinkedIn"
                                          disabled={
                                            !hasAccount(
                                              EProviders.Twitter,
                                              session.data?.user.accounts,
                                            ) ||
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
                              )}
                            </div>
                            <div className="space-y-3">
                              <h6>Options</h6>
                              <FormField
                                control={form.control}
                                name="asEvergreen"
                                render={({ field }) => (
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="asEvergreen"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />{" "}
                                      <Label htmlFor="asEvergreen">
                                        Evergreen
                                      </Label>
                                    </div>
                                  </FormControl>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="addFinisher"
                                render={({ field }) => (
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="addFinisher"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />{" "}
                                      <Label htmlFor="addFinisher">
                                        Add Finisher
                                      </Label>
                                    </div>
                                  </FormControl>
                                )}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-center">Settings</p>
                      </TooltipContent>
                    </Tooltip>{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          id="best-posts"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsBestPostsSheetOpen(true)}
                        >
                          <Iconify
                            icon="solar:stars-bold-duotone"
                            className="text-foreground/80"
                            fontSize={26}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-center">Best Posts</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          id="post-templates"
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsTemplateSheetOpen(true)}
                        >
                          <Iconify
                            icon="solar:documents-bold-duotone"
                            className="text-foreground/80"
                            fontSize={26}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-center">Templates</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          id="post-drafts"
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsDraftSheetOpen(true)}
                        >
                          <Iconify
                            icon="solar:file-text-bold-duotone"
                            className="text-foreground/80"
                            fontSize={26}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-center">Drafts</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          id="post-notes"
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsNotesSheetOpen(true)}
                        >
                          <Iconify
                            icon="solar:document-add-bold-duotone"
                            className="text-foreground/80"
                            fontSize={26}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-center">Notes</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          id="post-preview"
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
                        All threads and images (up to 20) will be posted as a
                        single post on LinkedIn
                        <br /> (Polls are not supported on LinkedIn)
                      </AlertDescription>
                    </Alert>
                  </p>
                )}
                {withInspiration && (
                  <p>
                    <Alert>
                      <InfoCircledIcon className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        The auto-generated threads are based on the inspiration
                        you have selected. You can edit, delete, or add more
                        threads. <br />
                        (Some threads may be split into multiple threads due to
                        the character limit on Twitter make sure to check all
                        the threads before posting)
                      </AlertDescription>
                    </Alert>
                  </p>
                )}
              </div>
              <div>
                <div>
                  <div className="w-full">
                    <div className="px-1 pb-14">
                      {form.getValues("posts").map((post) => (
                        <Fragment key={post.index}>
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
                                ?.map((image, index) => (
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
                              {post?.images?.map((image, index) => (
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
                              {post?.gif && (
                                <div className="group relative w-fit overflow-hidden rounded">
                                  <Image
                                    src={post.gif as string}
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

                              {post?.poll && (
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
                                                onChange={async (e) => {
                                                  field.onChange(e);
                                                  await form.trigger(
                                                    `posts.${post.index}.poll.options.${index}`,
                                                  );
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
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
                                  ))}
                                  <FormField
                                    control={form.control}
                                    name={`posts.${post.index}.poll.durationMins`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          Poll duration in hours
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            type="number"
                                            placeholder="Poll duration in hours (0 for no duration)"
                                            className="w-full"
                                            onChange={(e) =>
                                              field.onChange(
                                                Number(e.target.value),
                                              )
                                            }
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
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      id="add-thread"
                                      size="icon"
                                      type="button"
                                      variant="ghost"
                                      onClick={handleAddThread(post.index + 1)}
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
                                {form.getValues("posts").length > 1 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Button
                                        id="delete-thread"
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
                              </div>
                              <div className={cn("flex items-center gap-2")}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div>
                                      <ImageUploading
                                        multiple
                                        onChange={onImagesUpload(post.index)}
                                        maxNumber={
                                          form.getValues("onTwitter")
                                            ? TWITTER_MAX_IMAGES
                                            : LINKEDIN_MAX_IMAGES
                                        }
                                        value={
                                          getPostContent(post.index)?.images ??
                                          []
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
                                              id="upload-images"
                                              size="icon"
                                              type="button"
                                              variant="ghost"
                                              onClick={onImageUpload}
                                              disabled={
                                                imageList.length >=
                                                  (form.getValues("onTwitter")
                                                    ? TWITTER_MAX_IMAGES
                                                    : LINKEDIN_MAX_IMAGES) ||
                                                Boolean(post.gif) ||
                                                Boolean(post.poll)
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
                                      Boolean(post?.gif) ||
                                        Boolean(post.poll) ||
                                        ((post?.images ?? []).length === 4 &&
                                          "bg-destructive text-destructive-foreground"),
                                    )}
                                  >
                                    <p className="text-center">
                                      {Boolean(post?.gif) ||
                                      Boolean(post.poll) ? (
                                        `You can only add a gif or ${
                                          form.getValues("onTwitter")
                                            ? TWITTER_MAX_IMAGES
                                            : LINKEDIN_MAX_IMAGES
                                        } images or a poll`
                                      ) : (post?.images ?? []).length < 4 ? (
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
                                          id="upload-gif"
                                          type="button"
                                          variant="ghost"
                                          disabled={
                                            (post.images ?? []).length > 0 ||
                                            Boolean(post.poll)
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
                                          onGifClick={handleAddGif(post.index)}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    className={cn(
                                      Boolean(post.gif) ||
                                        Boolean(post.poll) ||
                                        ((post.images ?? []).length > 0 &&
                                          "bg-destructive text-destructive-foreground"),
                                    )}
                                  >
                                    <p className="text-center">
                                      {(post.images ?? []).length > 0 ||
                                      Boolean(post.poll) ? (
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
                                        id="add-poll"
                                        size="icon"
                                        type="button"
                                        variant="ghost"
                                        onClick={handleAddPoll(post.index)}
                                        disabled={
                                          (post.images ?? []).length > 0 ||
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
                                        Boolean(post.gif) ||
                                          Boolean(post.poll) ||
                                          ((post.images ?? []).length > 0 &&
                                            "bg-destructive text-destructive-foreground"),
                                      )}
                                    >
                                      <p className="text-center">
                                        {(post.images ?? []).length > 0 ||
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
                                          id="add-emoji"
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
                                {form.getValues("onTwitter") && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            id="thread-settings"
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
                                        </PopoverContent>
                                      </Popover>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="text-center">
                                        More options
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>

                  <BottomButtons id="post-buttons">
                    <div className="flex  items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDesktop ? (
                          <Dialog
                            open={isDraftDialogOpen}
                            onOpenChange={(open) => {
                              if (!open) setScheduleDate("");
                              setIsDraftDialogOpen(open);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot
                                }
                              >
                                {selectedDraftId
                                  ? "Update draft"
                                  : "Save as draft"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Set a reminder</DialogTitle>
                              </DialogHeader>
                              <div className="">
                                <div className="mt-3 grid w-full max-w-sm items-center gap-1.5">
                                  <Label htmlFor="custom-date">
                                    Reminder date
                                  </Label>
                                  <Input
                                    id="custom-date"
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={handleCustomDateChange}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  onClick={
                                    selectedDraftId
                                      ? handleUpdateDraft
                                      : handleSaveDraft
                                  }
                                >
                                  Save draft
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Drawer
                            open={isDraftDialogOpen}
                            onOpenChange={(open) => {
                              if (!open) setScheduleDate("");
                              setIsDraftDialogOpen(open);
                            }}
                          >
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot
                                }
                              >
                                {selectedDraftId
                                  ? "Update draft"
                                  : "Save as draft"}
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>Set a reminder</DrawerTitle>
                              </DrawerHeader>
                              <div className="p-4">
                                <div className="mt-3 grid w-full max-w-sm items-center gap-1.5">
                                  <Label htmlFor="custom-date">
                                    Reminder date
                                  </Label>
                                  <Input
                                    id="custom-date"
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={handleCustomDateChange}
                                  />
                                </div>
                              </div>
                              <DrawerFooter>
                                <Button
                                  type="button"
                                  onClick={
                                    selectedDraftId
                                      ? handleUpdateDraft
                                      : handleSaveDraft
                                  }
                                >
                                  Save draft
                                </Button>{" "}
                                <DrawerClose asChild>
                                  <Button variant="ghost">Close</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            !form.formState.isValid ||
                            isPostingNowOrScheduling ||
                            isAddingPostToSpot
                          }
                          onClick={handleSaveTemplate}
                        >
                          Save as template
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {isDesktop ? (
                          <Dialog
                            open={isRecurringDialogOpen}
                            onOpenChange={(open) => {
                              setIsRecurringDialogOpen(open);
                              if (!open) setSelectedSpots([]);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot ||
                                  isAddingRecurringPost
                                }
                              >
                                Pick recurring spot
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Pick a spot</DialogTitle>
                                <DialogDescription>
                                  Choose a recurring spot to post your content
                                </DialogDescription>
                              </DialogHeader>
                              <div className="">
                                {isRecurringSpotsLoading ? (
                                  <div className="flex h-24 items-center justify-center">
                                    <Spinner />
                                  </div>
                                ) : isRecurringSpotSuccess &&
                                  recurringSpots?.data.length > 0 ? (
                                  <>
                                    <Label className="mb-2">
                                      Recurring Spots
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {recurringSpots.data.map((spot) => (
                                        <Button
                                          variant={
                                            selectedSpots.some(
                                              (s) => s.id === spot.id,
                                            )
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() => {
                                            setScheduleDate("");
                                            setSelectedSpots((prev) => {
                                              if (
                                                prev.some(
                                                  (s) => s.id === spot.id,
                                                )
                                              ) {
                                                return prev.filter(
                                                  (s) => s.id !== spot.id,
                                                );
                                              }

                                              if (
                                                prev.some(
                                                  (s) =>
                                                    s.provider ===
                                                    EProviders.Twitter,
                                                )
                                              ) {
                                                return [
                                                  ...prev.filter(
                                                    (s) =>
                                                      s.provider !==
                                                      EProviders.Twitter,
                                                  ),
                                                  {
                                                    id: spot.id,
                                                    provider:
                                                      EProviders.Twitter,
                                                  },
                                                ];
                                              } else {
                                                return [
                                                  ...prev,
                                                  {
                                                    id: spot.id,
                                                    provider:
                                                      EProviders.Twitter,
                                                  },
                                                ];
                                              }
                                            });
                                          }}
                                        >
                                          {spot.days
                                            ?.map(
                                              (day) =>
                                                DAYS_OF_WEEK.find(
                                                  (d) => d.value === day,
                                                )?.label,
                                            )
                                            .join(", ")}{" "}
                                          at{" "}
                                          {format(
                                            new Date(spot.startTime ?? ""),
                                            "HH:mm",
                                          )}
                                        </Button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-24 items-center justify-center text-destructive">
                                    <p>No spots available</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  onClick={handleAddRecurringPost}
                                  disabled={selectedSpots.length === 0}
                                >
                                  Schedule
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Drawer
                            open={isRecurringDialogOpen}
                            onOpenChange={(open) => {
                              setIsRecurringDialogOpen(open);
                              if (!open) setSelectedSpots([]);
                            }}
                          >
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot ||
                                  isAddingRecurringPost
                                }
                              >
                                Pick recurring spot
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>Pick a spot</DrawerTitle>
                                <DrawerDescription>
                                  Choose a recurring spot to post your content
                                </DrawerDescription>
                              </DrawerHeader>
                              <div className="p-4">
                                {isRecurringSpotsLoading ? (
                                  <div className="flex h-24 items-center justify-center">
                                    <Spinner />
                                  </div>
                                ) : isRecurringSpotSuccess &&
                                  recurringSpots?.data.length > 0 ? (
                                  <>
                                    <Label className="mb-2">
                                      Recurring Spots
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {recurringSpots.data.map((spot) => (
                                        <Button
                                          variant={
                                            selectedSpots.some(
                                              (s) => s.id === spot.id,
                                            )
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() => {
                                            setScheduleDate("");
                                            setSelectedSpots((prev) => {
                                              if (
                                                prev.some(
                                                  (s) => s.id === spot.id,
                                                )
                                              ) {
                                                return prev.filter(
                                                  (s) => s.id !== spot.id,
                                                );
                                              }

                                              if (
                                                prev.some(
                                                  (s) =>
                                                    s.provider ===
                                                    EProviders.Twitter,
                                                )
                                              ) {
                                                return [
                                                  ...prev.filter(
                                                    (s) =>
                                                      s.provider !==
                                                      EProviders.Twitter,
                                                  ),
                                                  {
                                                    id: spot.id,
                                                    provider:
                                                      EProviders.Twitter,
                                                  },
                                                ];
                                              } else {
                                                return [
                                                  ...prev,
                                                  {
                                                    id: spot.id,
                                                    provider:
                                                      EProviders.Twitter,
                                                  },
                                                ];
                                              }
                                            });
                                          }}
                                        >
                                          {spot.days
                                            ?.map(
                                              (day) =>
                                                DAYS_OF_WEEK.find(
                                                  (d) => d.value === day,
                                                )?.label,
                                            )
                                            .join(", ")}{" "}
                                          at{" "}
                                          {format(
                                            new Date(spot.startTime ?? ""),
                                            "HH:mm",
                                          )}
                                        </Button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-24 items-center justify-center text-destructive">
                                    <p>No spots available</p>
                                  </div>
                                )}
                              </div>
                              <DrawerFooter>
                                <Button
                                  type="button"
                                  onClick={handleAddRecurringPost}
                                  disabled={selectedSpots.length === 0}
                                >
                                  Schedule
                                </Button>{" "}
                                <DrawerClose asChild>
                                  <Button variant="ghost">Close</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        )}
                        {isDesktop ? (
                          <Dialog
                            open={isScheduleDialogOpen}
                            onOpenChange={(open) => {
                              setIsScheduleDialogOpen(open);
                              if (!open) setScheduleDate("");
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot
                                }
                              >
                                Pick a time
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Pick a time</DialogTitle>
                                <DialogDescription>
                                  Choose a time to post your content
                                </DialogDescription>
                              </DialogHeader>
                              <div className="">
                                <div className="mt-3 grid w-full max-w-sm items-center gap-1.5">
                                  <Label htmlFor="custom-date">
                                    Custom date
                                  </Label>
                                  <Input
                                    id="custom-date"
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={handleCustomDateChange}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  onClick={handleSchedulePost}
                                  disabled={!scheduleDate}
                                >
                                  Schedule
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Drawer
                            open={isScheduleDialogOpen}
                            onOpenChange={(open) => {
                              setIsScheduleDialogOpen(open);
                              if (!open) setScheduleDate("");
                            }}
                          >
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot
                                }
                              >
                                Pick a time
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>Pick a time</DrawerTitle>
                                <DrawerDescription>
                                  Choose a time to post your content
                                </DrawerDescription>
                              </DrawerHeader>
                              <div className="p-4">
                                <div className="mt-3 grid w-full max-w-sm items-center gap-1.5">
                                  <Label htmlFor="custom-date">
                                    Custom date
                                  </Label>
                                  <Input
                                    id="custom-date"
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={handleCustomDateChange}
                                  />
                                </div>
                              </div>
                              <DrawerFooter>
                                <Button
                                  type="button"
                                  onClick={handleSchedulePost}
                                  disabled={!scheduleDate}
                                >
                                  Schedule
                                </Button>{" "}
                                <DrawerClose asChild>
                                  <Button variant="ghost">Close</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        )}

                        <Button
                          type="button"
                          disabled={
                            !form.formState.isValid ||
                            isPostingNowOrScheduling ||
                            isAddingPostToSpot ||
                            isAddingRecurringPost
                          }
                          onClick={handlePostNow}
                        >
                          Post now
                        </Button>
                        {isDesktop ? (
                          <Dialog
                            open={isQueueDialogOpen}
                            onOpenChange={(open) => {
                              setIsQueueDialogOpen(open);
                              if (!open) setSelectedSpots([]);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot ||
                                  isAddingRecurringPost
                                }
                              >
                                Add to queue
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Pick a time</DialogTitle>
                                <DialogDescription>
                                  Choose a time to post your content
                                </DialogDescription>
                              </DialogHeader>
                              <div className="">
                                {isSpotsLoading ? (
                                  <div className="flex h-24 items-center justify-center">
                                    <Spinner />
                                  </div>
                                ) : isSuccess && nextSpots?.data.length > 0 ? (
                                  <>
                                    {form.getValues("onTwitter") && (
                                      <div className="space-y-2">
                                        <Label className="mb-2">
                                          Twitter Spots
                                        </Label>

                                        <div className="mb-2 flex flex-wrap gap-2">
                                          {nextSpots.data
                                            .filter((spot) => spot.forTwitter)
                                            .map((spot) => (
                                              <Button
                                                variant={
                                                  selectedSpots.some(
                                                    (s) => s.id === spot.id,
                                                  )
                                                    ? "default"
                                                    : "outline"
                                                }
                                                onClick={() => {
                                                  setScheduleDate("");
                                                  setSelectedSpots((prev) => {
                                                    if (
                                                      prev.some(
                                                        (s) => s.id === spot.id,
                                                      )
                                                    ) {
                                                      return prev.filter(
                                                        (s) => s.id !== spot.id,
                                                      );
                                                    }

                                                    if (
                                                      prev.some(
                                                        (s) =>
                                                          s.provider ===
                                                          EProviders.Twitter,
                                                      )
                                                    ) {
                                                      return [
                                                        ...prev.filter(
                                                          (s) =>
                                                            s.provider !==
                                                            EProviders.Twitter,
                                                        ),
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Twitter,
                                                        },
                                                      ];
                                                    } else {
                                                      return [
                                                        ...prev,
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Twitter,
                                                        },
                                                      ];
                                                    }
                                                  });
                                                }}
                                              >
                                                <Iconify
                                                  icon="simple-icons:x"
                                                  className="mr-2"
                                                  fontSize={16}
                                                />

                                                {format(
                                                  new Date(spot.start ?? ""),
                                                  "dd MMM yyyy, HH:mm",
                                                )}
                                              </Button>
                                            ))}
                                        </div>
                                      </div>
                                    )}{" "}
                                    {form.getValues("onLinkedIn") && (
                                      <div className="space-y-2">
                                        {" "}
                                        <Label className="mb-2">
                                          LinkedIn Spots
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                          {nextSpots.data
                                            .filter((spot) => spot.forLinkedIn)
                                            .map((spot) => (
                                              <Button
                                                variant={
                                                  selectedSpots.some(
                                                    (s) => s.id === spot.id,
                                                  )
                                                    ? "default"
                                                    : "outline"
                                                }
                                                onClick={() => {
                                                  setScheduleDate("");
                                                  setSelectedSpots((prev) => {
                                                    if (
                                                      prev.some(
                                                        (s) => s.id === spot.id,
                                                      )
                                                    ) {
                                                      return prev.filter(
                                                        (s) => s.id !== spot.id,
                                                      );
                                                    }

                                                    if (
                                                      prev.some(
                                                        (s) =>
                                                          s.provider ===
                                                          EProviders.Linkedin,
                                                      )
                                                    ) {
                                                      return [
                                                        ...prev.filter(
                                                          (s) =>
                                                            s.provider !==
                                                            EProviders.Linkedin,
                                                        ),
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Linkedin,
                                                        },
                                                      ];
                                                    } else {
                                                      return [
                                                        ...prev,
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Linkedin,
                                                        },
                                                      ];
                                                    }
                                                  });
                                                }}
                                              >
                                                <Iconify
                                                  icon="simple-icons:linkedin"
                                                  className="mr-2"
                                                  fontSize={16}
                                                />

                                                {format(
                                                  new Date(spot.start ?? ""),
                                                  "dd MMM yyyy, HH:mm",
                                                )}
                                              </Button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex h-24 items-center justify-center text-destructive">
                                    <p>No spots available</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  onClick={handleSchedulePost}
                                  disabled={selectedSpots.length === 0}
                                >
                                  Schedule
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Drawer
                            open={isQueueDialogOpen}
                            onOpenChange={(open) => {
                              setIsQueueDialogOpen(open);
                              if (!open) setSelectedSpots([]);
                            }}
                          >
                            <DrawerTrigger asChild>
                              <Button
                                type="button"
                                disabled={
                                  !form.formState.isValid ||
                                  isPostingNowOrScheduling ||
                                  isAddingPostToSpot ||
                                  isAddingRecurringPost
                                }
                              >
                                Add to queue
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader>
                                <DrawerTitle>Pick a time</DrawerTitle>
                                <DrawerDescription>
                                  Choose a time to post your content
                                </DrawerDescription>
                              </DrawerHeader>
                              <div className="p-4">
                                {isSpotsLoading ? (
                                  <div className="flex h-24 items-center justify-center">
                                    <Spinner />
                                  </div>
                                ) : isSuccess && nextSpots?.data.length > 0 ? (
                                  <>
                                    {form.getValues("onTwitter") && (
                                      <div className="space-y-2">
                                        <Label className="mb-2">
                                          Twitter Spots
                                        </Label>

                                        <div className="mb-2 flex flex-wrap gap-2">
                                          {nextSpots.data
                                            .filter((spot) => spot.forTwitter)
                                            .map((spot) => (
                                              <Button
                                                variant={
                                                  selectedSpots.some(
                                                    (s) => s.id === spot.id,
                                                  )
                                                    ? "default"
                                                    : "outline"
                                                }
                                                onClick={() => {
                                                  setScheduleDate("");
                                                  setSelectedSpots((prev) => {
                                                    if (
                                                      prev.some(
                                                        (s) => s.id === spot.id,
                                                      )
                                                    ) {
                                                      return prev.filter(
                                                        (s) => s.id !== spot.id,
                                                      );
                                                    }

                                                    if (
                                                      prev.some(
                                                        (s) =>
                                                          s.provider ===
                                                          EProviders.Twitter,
                                                      )
                                                    ) {
                                                      return [
                                                        ...prev.filter(
                                                          (s) =>
                                                            s.provider !==
                                                            EProviders.Twitter,
                                                        ),
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Twitter,
                                                        },
                                                      ];
                                                    } else {
                                                      return [
                                                        ...prev,
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Twitter,
                                                        },
                                                      ];
                                                    }
                                                  });
                                                }}
                                              >
                                                <Iconify
                                                  icon="simple-icons:x"
                                                  className="mr-2"
                                                  fontSize={16}
                                                />

                                                {format(
                                                  new Date(spot.start ?? ""),
                                                  "dd MMM yyyy, HH:mm",
                                                )}
                                              </Button>
                                            ))}
                                        </div>
                                      </div>
                                    )}{" "}
                                    {form.getValues("onLinkedIn") && (
                                      <div className="space-y-2">
                                        {" "}
                                        <Label className="mb-2">
                                          LinkedIn Spots
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                          {nextSpots.data
                                            .filter((spot) => spot.forLinkedIn)
                                            .map((spot) => (
                                              <Button
                                                variant={
                                                  selectedSpots.some(
                                                    (s) => s.id === spot.id,
                                                  )
                                                    ? "default"
                                                    : "outline"
                                                }
                                                onClick={() => {
                                                  setScheduleDate("");
                                                  setSelectedSpots((prev) => {
                                                    if (
                                                      prev.some(
                                                        (s) => s.id === spot.id,
                                                      )
                                                    ) {
                                                      return prev.filter(
                                                        (s) => s.id !== spot.id,
                                                      );
                                                    }

                                                    if (
                                                      prev.some(
                                                        (s) =>
                                                          s.provider ===
                                                          EProviders.Linkedin,
                                                      )
                                                    ) {
                                                      return [
                                                        ...prev.filter(
                                                          (s) =>
                                                            s.provider !==
                                                            EProviders.Linkedin,
                                                        ),
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Linkedin,
                                                        },
                                                      ];
                                                    } else {
                                                      return [
                                                        ...prev,
                                                        {
                                                          id: spot.id,
                                                          provider:
                                                            EProviders.Linkedin,
                                                        },
                                                      ];
                                                    }
                                                  });
                                                }}
                                              >
                                                <Iconify
                                                  icon="simple-icons:linkedin"
                                                  className="mr-2"
                                                  fontSize={16}
                                                />

                                                {format(
                                                  new Date(spot.start ?? ""),
                                                  "dd MMM yyyy, HH:mm",
                                                )}
                                              </Button>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex h-24 items-center justify-center text-destructive">
                                    <p>No spots available</p>
                                  </div>
                                )}
                              </div>
                              <DrawerFooter>
                                <Button
                                  type="button"
                                  onClick={handleSchedulePost}
                                  disabled={selectedSpots.length === 0}
                                >
                                  Schedule
                                </Button>
                                <DrawerClose asChild>
                                  <Button variant="ghost">Close</Button>
                                </DrawerClose>
                              </DrawerFooter>
                            </DrawerContent>
                          </Drawer>
                        )}
                      </div>
                    </div>
                  </BottomButtons>
                </div>
              </div>
            </CardContent>
          </Form>
          <Note noteId={noteId} closeNote={handleCloseNote} />
        </div>
      </TooltipProvider>
      <PreviewSheet
        isPreviewSheetOpen={isPreviewSheetOpen}
        setIsPreviewSheetOpen={setIsPreviewSheetOpen}
        form={form}
      />
      <DraftSheet
        isOpen={isDraftSheetOpen}
        setIsOpen={setIsDraftSheetOpen}
        editDraft={handleEditDraft}
      />
      <TemplateSheet
        isOpen={isTemplateSheetOpen}
        setIsOpen={setIsTemplateSheetOpen}
        useTemplate={handleUseTemplate}
      />
      <NotesSheet
        isOpen={isNotesSheetOpen}
        setIsOpen={setIsNotesSheetOpen}
        openNote={handleOpenNote}
      />
      <BestPostsSheet
        isOpen={isBestPostsSheetOpen}
        setIsOpen={setIsBestPostsSheetOpen}
        importPost={handleUseBestPost}
      />
    </>
  );
}
