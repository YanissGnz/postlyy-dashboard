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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  useAddPostNowMutation,
  useAddPostToQueueMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
  useDeleteDraftImageMutation,
  useGetDraftMutation,
  useGetTemplateMutation,
  useUpdateDraftMutation,
} from "@/redux/api/post/apiSlice";
import {
  useGetNextFiveSpotsQuery,
  useGetRecurringSpotsQuery,
} from "@/redux/api/calendar/apiSlice";
import { addDays, format } from "date-fns";
import { useBoolean, useMediaQuery } from "usehooks-ts";
import DraftSheet from "./draft-sheet";
import TemplateSheet from "./template-sheet";
import PreviewSheet from "./preview-sheet";
import { DAYS_OF_WEEK } from "../calendar/add-edit-event-form";
import { LAYOUT } from "@/lib/constants";
import NotesSheet from "./notes-sheet";
import Note from "./note";
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

// async function imageUrlToFile(imageUrl: string) {
//   try {
//     const response = await fetch(imageUrl);
//     if (!response.ok) {
//       toast.error("Failed to fetch image");
//     }
//     const blob = await response.blob();
//     const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
//     const file = new File([blob], filename, { type: blob.type });
//     return file;
//   } catch (error) {
//     console.error("Error:", error);
//     toast.error("Failed to fetch image");
//   }
// }

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
        formData.append(`Posts[${index}].poll.Options[${i}]`, option);
      });
    }
  });

  return formData;
};

export default function PostPage() {
  const { currentAccount } = useAppSelector((state) => state.auth);
  const { isCollapsed } = useAppSelector((state) => state.layout);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const session = useSession();
  const { theme, systemTheme } = useTheme();

  const {
    data: nextSpots,
    isLoading: isSpotsLoading,
    isSuccess,
  } = useGetNextFiveSpotsQuery();
  const {
    data: recurringSpots,
    isLoading: isRecurringSpotsLoading,
    isSuccess: isRecurringSpotSuccess,
  } = useGetRecurringSpotsQuery();

  const [postNowOrSchedule, { isLoading: isPostingNowOrScheduling }] =
    useAddPostNowMutation();
  const [addPostToSpot, { isLoading: isAddingPostToSpot }] =
    useAddPostToSpotMutation();
  const [addPostToQueue, { isLoading: isAddingToQueue }] =
    useAddPostToQueueMutation();
  const [addRecurringPost, { isLoading: isAddingRecurringPost }] =
    useAddRecurringPostMutation();

  const [getDraft] = useGetDraftMutation();
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
  const { value: isTemplateSheetOpen, setValue: setIsTemplateSheetOpen } =
    useBoolean(false);
  const { value: isNotesSheetOpen, setValue: setIsNotesSheetOpen } =
    useBoolean(false);
  const { value: isPreviewSheetOpen, setValue: setIsPreviewSheetOpen } =
    useBoolean(false);

  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

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
      onLinkedIn: currentAccount?.accountType === 1,
      onTwitter: currentAccount?.accountType === 0,
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
    if (isSuccess && nextSpots.data.length > 0) {
      setSelectedSpot(nextSpots?.data?.[0]?.id ?? null);
    }
  }, [isSuccess, isSpotsLoading]);

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

  const handleCustomDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedSpot(null);
      setScheduleDate(e.target.value);
    },
    [],
  );

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

  const handleAddToQueue = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    const data = await generateFormData(form.getValues());

    const addToQueuePromise = addPostToQueue(data).unwrap();
    toast.promise(addToQueuePromise, {
      loading: "Adding to queue...",
      success: () => {
        form.reset(defaultValues);
        setPostsContent([
          {
            index: 0,
            images: [],
          },
        ]);
        return "Added to queue!";
      },
      error: "Something went wrong",
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
      data.append("scheduleDate", scheduleDate);

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
    } else if (selectedSpot !== null) {
      setIsScheduleDialogOpen(false);
      const schedulePostPromise = addPostToSpot({
        body: data,
        spotId: selectedSpot,
      }).unwrap();
      toast.promise(schedulePostPromise, {
        loading: "Scheduling post...",
        success: "Scheduled post!",
        error: "Something went wrong",
      });
      form.reset(defaultValues);
      setPostsContent([
        {
          index: 0,
          images: [],
        },
      ]);
    } else {
      toast.error("Please select a date or a spot");
    }
    setScheduleDate("");
  }, [scheduleDate, selectedSpot, form]);

  const handleAddRecurringPost = useCallback(async () => {
    if (!selectedSpot) return;
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    const data = await generateFormData(form.getValues());

    const addRecurringPostPromise = addRecurringPost({
      body: data,
      recurringId: selectedSpot,
    }).unwrap();
    toast.promise(addRecurringPostPromise, {
      loading: "Adding recurring post...",
      success: () => {
        setSelectedSpot(null);
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
  }, [selectedSpot, form]);

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
      "scheduleDate",
      scheduleDate ? scheduleDate : addDays(new Date(), 7).toISOString(),
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

  // Draft

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
      "scheduleDate",
      scheduleDate ? scheduleDate : form.getValues("scheduleDate"),
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
          onLinkedIn: data.data.onLinkedIn,
          onTwitter: data.data.onTwitter,
          scheduleDate: data.data.scheduleDate,
          posts: newPosts,
        };
        postFormSchema
          .parseAsync(newForm)
          .then((data) => {
            form.reset(data);
            setIsDraftSheetOpen(false);
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

            setIsDraftSheetOpen(false);
          });
        return "Fetched draft!";
      },
      error: "Failed to fetch draft",
    });
  }, []);

  // Template

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
          onLinkedIn: data.data.onLinkedIn,
          onTwitter: data.data.onTwitter,
          scheduleDate: data.data.scheduleDate ?? "",
          posts: newPosts,
        };
        postFormSchema
          .parseAsync(newForm)
          .then((data) => {
            form.reset(data);
            setIsTemplateSheetOpen(false);
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

  return (
    <>
      <TooltipProvider>
        <div className="flex w-full">
          <Form {...form}>
            <CardContent className="mx-auto max-w-5xl flex-1 transition-all">
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
                            <Button size="icon" type="button" variant="ghost">
                              <Iconify
                                icon="solar:tuning-2-bold-duotone"
                                className="text-foreground/80"
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
                                        !hasAccount(0) ||
                                        (!form.getValues("onTwitter") &&
                                          field.value)
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
                    </Tooltip>{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
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
                          size="icon"
                          type="button"
                          variant="ghost"
                          onClick={() => setIsNotesSheetOpen(true)}
                        >
                          <Iconify
                            icon="solar:notebook-bold-duotone"
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
                                    src={getPostContent(post.index)?.gif ?? ""}
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
                                                onChange={async (e) => {
                                                  field.onChange(e);
                                                  await form.trigger("posts");
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
                                          Poll duration in minutes
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            type="number"
                                            placeholder="Poll duration in minutes (0 for no duration)"
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
                                              size="icon"
                                              type="button"
                                              variant="ghost"
                                              onClick={onImageUpload}
                                              disabled={
                                                imageList.length >=
                                                  (form.getValues("onTwitter")
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
                                          getPostContent(post.index)?.images ??
                                          []
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
                                          getPostContent(post.index)?.images ??
                                          []
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
                                      Boolean(
                                        getPostContent(post.index)?.gif,
                                      ) ||
                                        Boolean(post.poll) ||
                                        ((
                                          getPostContent(post.index)?.images ??
                                          []
                                        ).length > 0 &&
                                          "bg-destructive text-destructive-foreground"),
                                    )}
                                  >
                                    <p className="text-center">
                                      {(
                                        getPostContent(post.index)?.images ?? []
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
                                          getPostContent(post.index)?.images ??
                                          []
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
                                    <p className="text-center">More options</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>

                  <div
                    className="fixed bottom-0 right-0 flex items-center justify-between gap-2 overflow-auto bg-background p-2 transition-all duration-500"
                    style={{
                      left: isMobile
                        ? 0
                        : isCollapsed
                          ? LAYOUT.COLLAPSED_SIDEBAR_WIDTH
                          : LAYOUT.SIDEBAR_WIDTH,
                    }}
                  >
                    <div className="flex  items-center gap-2">
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
                            {selectedDraftId ? "Update draft" : "Save as draft"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Set a reminder</DialogTitle>
                          </DialogHeader>
                          <div className="">
                            <div className="mt-3 grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="custom-date">Reminder date</Label>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={
                              !form.formState.isValid ||
                              isPostingNowOrScheduling ||
                              isAddingPostToSpot ||
                              isAddingToQueue ||
                              isAddingRecurringPost
                            }
                          >
                            Pick recurring spot
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Pick a slot</DialogTitle>
                            <DialogDescription>
                              Choose a recurring slot to post your content
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
                                <Label className="mb-2">Recurring Slots</Label>
                                <div className="flex flex-wrap gap-2">
                                  {recurringSpots.data.map((spot) => (
                                    <Button
                                      variant={
                                        selectedSpot === spot.id
                                          ? "default"
                                          : "outline"
                                      }
                                      onClick={() => {
                                        setSelectedSpot(spot.id);
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
                            >
                              Schedule
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog
                        open={isScheduleDialogOpen}
                        onOpenChange={(open) => setIsScheduleDialogOpen(open)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={
                              !form.formState.isValid ||
                              isPostingNowOrScheduling ||
                              isAddingPostToSpot ||
                              isAddingToQueue
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
                            {isSpotsLoading ? (
                              <div className="flex h-24 items-center justify-center">
                                <Spinner />
                              </div>
                            ) : isSuccess && nextSpots?.data.length > 0 ? (
                              <>
                                <Label className="mb-2">Time Slots</Label>
                                <div className="flex flex-wrap gap-2">
                                  {nextSpots.data.map((spot) => (
                                    <Button
                                      variant={
                                        selectedSpot === spot.id
                                          ? "default"
                                          : "outline"
                                      }
                                      onClick={() => {
                                        setScheduleDate("");
                                        setSelectedSpot(spot.id);
                                      }}
                                    >
                                      {format(
                                        new Date(spot.start ?? ""),
                                        "dd MMM yyyy, HH:mm",
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
                            <div className="mt-3 grid w-full max-w-sm items-center gap-1.5 border-t pt-2">
                              <Label htmlFor="custom-date">Custom date</Label>
                              <Input
                                id="custom-date"
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={handleCustomDateChange}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" onClick={handleSchedulePost}>
                              Schedule
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          !form.formState.isValid ||
                          isPostingNowOrScheduling ||
                          isAddingPostToSpot ||
                          isAddingToQueue
                        }
                        onClick={handlePostNow}
                      >
                        Post now
                      </Button>
                      <Button
                        type="button"
                        disabled={
                          !form.formState.isValid ||
                          isPostingNowOrScheduling ||
                          isAddingPostToSpot ||
                          isAddingToQueue
                        }
                        onClick={handleAddToQueue}
                      >
                        Add to queue
                      </Button>
                    </div>
                  </div>
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
        postsContent={postsContent}
        getPostContent={getPostContent}
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
    </>
  );
}
