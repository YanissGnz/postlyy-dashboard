"use client";

import BottomButtons from "@/components/bottom-buttons";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import Iconify from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth/client";
import { hasAccount } from "@/lib/utils";
import {
  useGetNextFiveSpotsQuery,
  useGetRecurringSpotsQuery,
} from "@/redux/api/calendar/apiSlice";
import {
  useAddPostNowMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
} from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { EProviders } from "@/types/EProviders";
import { postFormSchema, type TPostForm } from "@/types/TPostForm";
import { Parser } from "@alkhipce/editorjs-react";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toBlob } from "html-to-image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useBoolean, useMediaQuery } from "usehooks-ts";
import { useGetNoteQuery } from "../../../../redux/api/notes/apiSlice";
import { DAYS_OF_WEEK } from "../../calendar/add-edit-event-form";

const generateFormData = (data: TPostForm) => {
  const formData = new FormData();

  formData.append("AsEvergreen", data.asEvergreen ? "true" : "false");
  formData.append("OnLinkedIn", data.onLinkedIn ? "true" : "false");
  formData.append("OnTwitter", data.onTwitter ? "true" : "false");

  data.posts.forEach((post, index) => {
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
export default function page({ params }: { params: { id: string } }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const {
    data: note,
    isLoading: isLoadingNote,
    isSuccess: isNoteSuccess,
  } = useGetNoteQuery(params.id);

  const {
    data: recurringSpots,
    isLoading: isRecurringSpotsLoading,
    isSuccess: isRecurringSpotSuccess,
  } = useGetRecurringSpotsQuery();

  const { currentAccount } = useAppSelector((state) => state.auth);

  const { data: session } = useAuth();

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
    mode: "all",
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (currentAccount?.accountType === EProviders.Linkedin) {
      form.setValue("onLinkedIn", true);
    } else if (currentAccount?.accountType === EProviders.Twitter) {
      form.setValue("onTwitter", true);
    }
  }, [currentAccount?.accountType]);

  const {
    data: nextSpots,
    isLoading: isSpotsLoading,
    isSuccess: isSpotsSuccess,
  } = useGetNextFiveSpotsQuery(
    {
      providers: [
        ...(form.getValues("onTwitter") ? [EProviders.Twitter] : []),
        ...(form.getValues("onLinkedIn") ? [EProviders.Linkedin] : []),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [postNowOrSchedule, { isLoading: isPostingNowOrScheduling }] =
    useAddPostNowMutation();
  const [addPostToSpot, { isLoading: isAddingPostToSpot }] =
    useAddPostToSpotMutation();
  const [addRecurringPost, { isLoading: isAddingRecurringPost }] =
    useAddRecurringPostMutation();

  const { value: isScheduleDialogOpen, setValue: setIsScheduleDialogOpen } =
    useBoolean(false);
  const { value: isQueueDialogOpen, setValue: setIsQueueDialogOpen } =
    useBoolean(false);
  const { value: isPostNowDialogOpen, setValue: setIsPostNowDialogOpen } =
    useBoolean(false);
  const [selectedSpots, setSelectedSpots] = useState<
    Array<{
      id: string;
      provider: EProviders;
    }>
  >([]);
  const [scheduleDate, setScheduleDate] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (isNoteSuccess) {
      return JSON.parse(note.data.content) as IParser;
    }
    return null;
  }, [isNoteSuccess, note]);

  const handleCustomDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedSpots([]);
      setScheduleDate(e.target.value);
    },
    [],
  );

  const handlePostNow = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    if (!ref.current || !note) return;

    toBlob(ref.current)
      .then(async (blob) => {
        if (blob) {
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          const postNowPromise = postNowOrSchedule(data).unwrap();
          toast.promise(postNowPromise, {
            loading: "Posting...",
            success: () => {
              setIsPostNowDialogOpen(false);
              form.reset();
              return "Posted!";
            },
            error: "Something went wrong",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [ref, note, form]);

  const handleCustomSchedulePost = useCallback(async () => {
    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }
    if (scheduleDate === "") {
      toast.error("Please select a date");
      return;
    }

    if (!ref.current || !note) return;

    toBlob(ref.current)
      .then(async (blob) => {
        if (blob) {
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          const postNowPromise = postNowOrSchedule(data).unwrap();
          toast.promise(postNowPromise, {
            loading: "Scheduling...",
            success: () => {
              setIsScheduleDialogOpen(false);
              form.reset();
              setScheduleDate("");
              return "Scheduled!";
            },
            error: "Something went wrong",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [scheduleDate, form]);

  const handleAddRecurringPost = useCallback(async () => {
    if (selectedSpots.length === 0) return;

    if (!ref.current || !note) return;

    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    toBlob(ref.current)
      .then(async (blob) => {
        if (blob) {
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          const postNowPromise = addRecurringPost({
            body: data,
            recurringId: selectedSpots[0]?.id ?? "",
          }).unwrap();
          toast.promise(postNowPromise, {
            loading: "Scheduling...",
            success: () => {
              setIsScheduleDialogOpen(false);
              setSelectedSpots([]);
              form.reset();
              return "Scheduled!";
            },
            error: "Something went wrong",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedSpots, ref, form]);

  const handleSchedulePostToSpot = useCallback(async () => {
    if (selectedSpots.length === 0) return;

    if (!ref.current || !note) return;

    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    toBlob(ref.current)
      .then(async (blob) => {
        if (blob) {
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          selectedSpots.forEach((spot) => {
            if (spot.provider === EProviders.Twitter) {
              data.append("onTwitter", "true");
              data.delete("onLinkedIn");
            } else {
              data.append("onLinkedIn", "true");
              data.delete("onTwitter");
            }

            const postNowPromise = addPostToSpot({
              body: data,
              spotId: spot.id,
            }).unwrap();
            toast.promise(postNowPromise, {
              loading: "Scheduling...",
              success: () => {
                setIsQueueDialogOpen(false);
                setSelectedSpots([]);
                form.reset();
                return "Scheduled!";
              },
              error: "Something went wrong",
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [selectedSpots, ref, form]);

  return (
    <>
      {isLoadingNote ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner />
        </div>
      ) : isNoteSuccess && content ? (
        <div>
          <div className="space-y-2 px-4 py-4 md:px-8">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{note.data.name}</h2>
            </div>
            <div className="prose mx-auto max-w-4xl dark:prose-invert ">
              <Parser data={content} />
            </div>
          </div>
          <div className="sr-only">
            <div ref={ref} className="prose min-w-[300px] px-5">
              <Parser data={content} />
              <div className="flex justify-end p-2 text-xs text-muted-foreground">
                <p>Made by Postlyy</p>
              </div>
            </div>
          </div>
          <BottomButtons>
            <div className="flex items-center gap-2">
              {isDesktop ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={
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
                    <div className="space-y-2">
                      {" "}
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      {isRecurringSpotsLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <Spinner />
                        </div>
                      ) : isRecurringSpotSuccess &&
                        recurringSpots?.data.length > 0 ? (
                        <>
                          <Label className="mb-2">Recurring Spots</Label>
                          <div className="flex flex-wrap gap-2">
                            {recurringSpots.data.map((spot) => (
                              <Button
                                variant={
                                  selectedSpots.some((s) => s.id === spot.id)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => {
                                  setScheduleDate("");
                                  setSelectedSpots((prev) => {
                                    if (prev.some((s) => s.id === spot.id)) {
                                      return prev.filter(
                                        (s) => s.id !== spot.id,
                                      );
                                    }

                                    if (
                                      prev.some(
                                        (s) =>
                                          s.provider === EProviders.Twitter,
                                      )
                                    ) {
                                      return [
                                        ...prev.filter(
                                          (s) =>
                                            s.provider !== EProviders.Twitter,
                                        ),
                                        {
                                          id: spot.id,
                                          provider: EProviders.Twitter,
                                        },
                                      ];
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          id: spot.id,
                                          provider: EProviders.Twitter,
                                        },
                                      ];
                                    }
                                  });
                                }}
                              >
                                {spot.days
                                  ?.map(
                                    (day) =>
                                      DAYS_OF_WEEK.find((d) => d.value === day)
                                        ?.label,
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
                        disabled={
                          selectedSpots.length === 0 || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
                      }
                    >
                      Pick recurring spot
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="sm:max-w-[425px]">
                    <DrawerHeader>
                      <DrawerTitle>Pick a spot</DrawerTitle>
                      <DrawerDescription>
                        Choose a recurring spot to post your content
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-2 p-4">
                      {" "}
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      {isRecurringSpotsLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <Spinner />
                        </div>
                      ) : isRecurringSpotSuccess &&
                        recurringSpots?.data.length > 0 ? (
                        <>
                          <Label className="mb-2">Recurring Spots</Label>
                          <div className="flex flex-wrap gap-2">
                            {recurringSpots.data.map((spot) => (
                              <Button
                                variant={
                                  selectedSpots.some((s) => s.id === spot.id)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => {
                                  setScheduleDate("");
                                  setSelectedSpots((prev) => {
                                    if (prev.some((s) => s.id === spot.id)) {
                                      return prev.filter(
                                        (s) => s.id !== spot.id,
                                      );
                                    }

                                    if (
                                      prev.some(
                                        (s) =>
                                          s.provider === EProviders.Twitter,
                                      )
                                    ) {
                                      return [
                                        ...prev.filter(
                                          (s) =>
                                            s.provider !== EProviders.Twitter,
                                        ),
                                        {
                                          id: spot.id,
                                          provider: EProviders.Twitter,
                                        },
                                      ];
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          id: spot.id,
                                          provider: EProviders.Twitter,
                                        },
                                      ];
                                    }
                                  });
                                }}
                              >
                                {spot.days
                                  ?.map(
                                    (day) =>
                                      DAYS_OF_WEEK.find((d) => d.value === day)
                                        ?.label,
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
                        disabled={
                          selectedSpots.length === 0 || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
              {isDesktop ? (
                <Dialog
                  open={isScheduleDialogOpen}
                  onOpenChange={(open) => setIsScheduleDialogOpen(open)}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
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
                    <div className="space-y-2">
                      {" "}
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      <div className="mt-3 w-full">
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
                      <Button
                        type="button"
                        onClick={handleCustomSchedulePost}
                        disabled={
                          scheduleDate === "" || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Drawer
                  open={isScheduleDialogOpen}
                  onOpenChange={(open) => setIsScheduleDialogOpen(open)}
                >
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
                      }
                    >
                      Pick a time
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="sm:max-w-[425px]">
                    <DrawerHeader>
                      <DrawerTitle>Pick a time</DrawerTitle>
                      <DrawerDescription>
                        Choose a time to post your content
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-2 p-4">
                      {" "}
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      <div className="mt-3 w-full">
                        <Label htmlFor="custom-date">Custom date</Label>
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
                        onClick={handleCustomSchedulePost}
                        disabled={
                          scheduleDate === "" || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
              {isDesktop ? (
                <Dialog
                  open={isQueueDialogOpen}
                  onOpenChange={(open) => setIsQueueDialogOpen(open)}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={
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
                    <div className="space-y-2">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      {isSpotsLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <Spinner />
                        </div>
                      ) : isSpotsSuccess && nextSpots?.data.length > 0 ? (
                        <>
                          {form.getValues("onTwitter") && (
                            <Label className="mb-2">Twitter Spots</Label>
                          )}{" "}
                          <div className="mb-2 flex flex-wrap gap-2">
                            {nextSpots.data
                              .filter((spot) => spot.forTwitter)
                              .map((spot) => (
                                <Button
                                  variant={
                                    selectedSpots.some((s) => s.id === spot.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    setScheduleDate("");
                                    setSelectedSpots((prev) => {
                                      if (prev.some((s) => s.id === spot.id)) {
                                        return prev.filter(
                                          (s) => s.id !== spot.id,
                                        );
                                      }

                                      if (
                                        prev.some(
                                          (s) =>
                                            s.provider === EProviders.Twitter,
                                        )
                                      ) {
                                        return [
                                          ...prev.filter(
                                            (s) =>
                                              s.provider !== EProviders.Twitter,
                                          ),
                                          {
                                            id: spot.id,
                                            provider: EProviders.Twitter,
                                          },
                                        ];
                                      } else {
                                        return [
                                          ...prev,
                                          {
                                            id: spot.id,
                                            provider: EProviders.Twitter,
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
                          {form.getValues("onLinkedIn") && (
                            <Label className="mb-2">LinkedIn Spots</Label>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {nextSpots.data
                              .filter((spot) => spot.forLinkedIn)
                              .map((spot) => (
                                <Button
                                  variant={
                                    selectedSpots.some((s) => s.id === spot.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    setScheduleDate("");
                                    setSelectedSpots((prev) => {
                                      if (prev.some((s) => s.id === spot.id)) {
                                        return prev.filter(
                                          (s) => s.id !== spot.id,
                                        );
                                      }

                                      if (
                                        prev.some(
                                          (s) =>
                                            s.provider === EProviders.Linkedin,
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
                                            provider: EProviders.Linkedin,
                                          },
                                        ];
                                      } else {
                                        return [
                                          ...prev,
                                          {
                                            id: spot.id,
                                            provider: EProviders.Linkedin,
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
                        onClick={handleSchedulePostToSpot}
                        disabled={
                          selectedSpots.length === 0 || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Drawer
                  open={isQueueDialogOpen}
                  onOpenChange={(open) => setIsQueueDialogOpen(open)}
                >
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
                      }
                    >
                      Add to queue
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="sm:max-w-[425px]">
                    <DrawerHeader>
                      <DrawerTitle>Pick a time</DrawerTitle>
                      <DrawerDescription>
                        Choose a time to post your content
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-2 p-4">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                      {isSpotsLoading ? (
                        <div className="flex h-24 items-center justify-center">
                          <Spinner />
                        </div>
                      ) : isSpotsSuccess && nextSpots?.data.length > 0 ? (
                        <>
                          {form.getValues("onTwitter") && (
                            <Label className="mb-2">Twitter Spots</Label>
                          )}{" "}
                          <div className="mb-2 flex flex-wrap gap-2">
                            {nextSpots.data
                              .filter((spot) => spot.forTwitter)
                              .map((spot) => (
                                <Button
                                  variant={
                                    selectedSpots.some((s) => s.id === spot.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    setScheduleDate("");
                                    setSelectedSpots((prev) => {
                                      if (prev.some((s) => s.id === spot.id)) {
                                        return prev.filter(
                                          (s) => s.id !== spot.id,
                                        );
                                      }

                                      if (
                                        prev.some(
                                          (s) =>
                                            s.provider === EProviders.Twitter,
                                        )
                                      ) {
                                        return [
                                          ...prev.filter(
                                            (s) =>
                                              s.provider !== EProviders.Twitter,
                                          ),
                                          {
                                            id: spot.id,
                                            provider: EProviders.Twitter,
                                          },
                                        ];
                                      } else {
                                        return [
                                          ...prev,
                                          {
                                            id: spot.id,
                                            provider: EProviders.Twitter,
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
                          {form.getValues("onLinkedIn") && (
                            <Label className="mb-2">LinkedIn Spots</Label>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {nextSpots.data
                              .filter((spot) => spot.forLinkedIn)
                              .map((spot) => (
                                <Button
                                  variant={
                                    selectedSpots.some((s) => s.id === spot.id)
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => {
                                    setScheduleDate("");
                                    setSelectedSpots((prev) => {
                                      if (prev.some((s) => s.id === spot.id)) {
                                        return prev.filter(
                                          (s) => s.id !== spot.id,
                                        );
                                      }

                                      if (
                                        prev.some(
                                          (s) =>
                                            s.provider === EProviders.Linkedin,
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
                                            provider: EProviders.Linkedin,
                                          },
                                        ];
                                      } else {
                                        return [
                                          ...prev,
                                          {
                                            id: spot.id,
                                            provider: EProviders.Linkedin,
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
                        onClick={handleSchedulePostToSpot}
                        disabled={
                          selectedSpots.length === 0 || !form.formState.isValid
                        }
                      >
                        Schedule
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
              {isDesktop ? (
                <Dialog
                  open={isPostNowDialogOpen}
                  onOpenChange={(open) => setIsPostNowDialogOpen(open)}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
                      }
                    >
                      Post now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Post this note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={handlePostNow}
                        disabled={!form.formState.isValid}
                      >
                        Post
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Drawer
                  open={isPostNowDialogOpen}
                  onOpenChange={(open) => setIsPostNowDialogOpen(open)}
                >
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      disabled={
                        isPostingNowOrScheduling ||
                        isAddingPostToSpot ||
                        isAddingRecurringPost
                      }
                    >
                      Post now
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="sm:max-w-[425px]">
                    <DrawerHeader>
                      <DrawerTitle>Post this note</DrawerTitle>
                    </DrawerHeader>
                    <div className="space-y-2 p-4">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name={`posts.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add a caption"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {field.value.length} / 280
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
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
                                        EProviders.Twitter,
                                        session?.accounts,
                                      ) ||
                                      (!form.getValues("onLinkedIn") &&
                                        field.value)
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
                                      !hasAccount(
                                        EProviders.Linkedin,
                                        session?.accounts,
                                      ) ||
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
                          <FormField
                            control={form.control}
                            name={`asEvergreen`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="asEvergreen"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="asEvergreen">
                                    Set as evergreen
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`addFinisher`}
                            render={({ field }) => (
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="addFinisher"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />{" "}
                                  <Label htmlFor="addFinisher">
                                    Add finisher
                                  </Label>
                                </div>
                              </FormControl>
                            )}
                          />{" "}
                          {form.getValues("onTwitter") && (
                            <FormField
                              control={form.control}
                              name={`posts.0.twitterDirectLink`}
                              render={({ field }) => (
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`posts.0.twitterDirectLink`}
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />{" "}
                                    <Label
                                      htmlFor={`posts.0.twitterDirectLink`}
                                    >
                                      Add a "DM me" Button
                                    </Label>
                                  </div>
                                </FormControl>
                              )}
                            />
                          )}
                        </div>
                      </Form>
                    </div>
                    <DrawerFooter>
                      <Button
                        type="button"
                        onClick={handlePostNow}
                        disabled={!form.formState.isValid}
                      >
                        Post
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </div>
          </BottomButtons>
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center">
          <p>Note not found</p>
        </div>
      )}
    </>
  );
}
