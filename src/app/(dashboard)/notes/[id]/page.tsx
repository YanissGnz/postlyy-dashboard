"use client";

import { Spinner } from "@/components/ui/Spinner";
import { toBlob } from "html-to-image";
import React, {
  type ChangeEvent,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
import { Parser } from "@alkhipce/editorjs-react";
import { type IParser } from "@alkhipce/editorjs-react/dist/types/ParserData";
import { useGetNoteQuery } from "../../../../redux/api/notes/apiSlice";
import BottomButtons from "@/components/bottom-buttons";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useAddPostNowMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
} from "@/redux/api/post/apiSlice";
import {
  useGetNextFiveSpotsQuery,
  useGetRecurringSpotsQuery,
} from "@/redux/api/calendar/apiSlice";
import { DAYS_OF_WEEK } from "../../calendar/add-edit-event-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { useBoolean } from "usehooks-ts";
import { Textarea } from "@/components/ui/textarea";
import { type TPostForm, postFormSchema } from "@/types/TPostForm";
import { useAppSelector } from "@/redux/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { generateFormData } from "../../post/page";

export default function page({ params }: { params: { id: string } }) {
  const {
    data: note,
    isLoading: isLoadingNote,
    isSuccess: isNoteSuccess,
  } = useGetNoteQuery(params.id);

  const {
    data: nextSpots,
    isLoading: isSpotsLoading,
    isSuccess: isSpotsSuccess,
  } = useGetNextFiveSpotsQuery();
  const {
    data: recurringSpots,
    isLoading: isRecurringSpotsLoading,
    isSuccess: isRecurringSpotSuccess,
  } = useGetRecurringSpotsQuery();

  const { currentAccount } = useAppSelector((state) => state.auth);

  const session = useSession();

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
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const ref = useRef<HTMLDivElement>(null);

  const content = useMemo(() => {
    if (isNoteSuccess) {
      return JSON.parse(note.data.content) as IParser;
    }
    return null;
  }, [isNoteSuccess, note]);

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

  const handleCustomDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedSpot(null);
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

    ref.current.style.backgroundColor = "white";
    ref.current.style.padding = "20px";

    toBlob(ref.current)
      .then((blob) => {
        if (blob) {
          if (ref.current) {
            ref.current.style.backgroundColor = "transparent";
            ref.current.style.padding = "0";
          }
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

    ref.current.style.backgroundColor = "white";
    ref.current.style.padding = "20px";

    toBlob(ref.current)
      .then((blob) => {
        if (blob) {
          if (ref.current) {
            ref.current.style.backgroundColor = "transparent";
            ref.current.style.padding = "0";
          }
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
    if (!selectedSpot) return;

    if (!ref.current || !note) return;

    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    ref.current.style.backgroundColor = "white";
    ref.current.style.padding = "20px";

    toBlob(ref.current)
      .then((blob) => {
        if (blob) {
          if (ref.current) {
            ref.current.style.backgroundColor = "transparent";
            ref.current.style.padding = "0";
          }
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          const postNowPromise = addRecurringPost({
            body: data,
            recurringId: selectedSpot,
          }).unwrap();
          toast.promise(postNowPromise, {
            loading: "Scheduling...",
            success: () => {
              setIsScheduleDialogOpen(false);
              setSelectedSpot(null);
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
  }, [selectedSpot, ref, form]);

  const handleSchedulePostToSlot = useCallback(async () => {
    if (!selectedSpot) return;

    if (!ref.current || !note) return;

    if (form.getValues("posts").length === 0 && !form.formState.isValid) {
      await form.trigger();
      return;
    }

    ref.current.style.backgroundColor = "white";
    ref.current.style.padding = "20px";

    toBlob(ref.current)
      .then((blob) => {
        if (blob) {
          if (ref.current) {
            ref.current.style.backgroundColor = "transparent";
            ref.current.style.padding = "0";
          }
          const data = generateFormData(form.getValues());
          const file = new File([blob], "note.png", {
            type: "image/png",
          });
          data.append("posts[0].images", file);

          const postNowPromise = addPostToSpot({
            body: data,
            spotId: selectedSpot,
          }).unwrap();
          toast.promise(postNowPromise, {
            loading: "Scheduling...",
            success: () => {
              setIsQueueDialogOpen(false);
              setSelectedSpot(null);
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
  }, [selectedSpot, ref, form]);

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
            <div
              ref={ref}
              className="prose mx-auto max-w-4xl dark:prose-invert "
            >
              <Parser data={content} />
            </div>
          </div>
          <BottomButtons>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button">Pick recurring spot</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Pick a slot</DialogTitle>
                  <DialogDescription>
                    Choose a recurring slot to post your content
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
                              <Label htmlFor="addFinisher">Add finisher</Label>
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
                                <Label htmlFor={`posts.0.twitterDirectLink`}>
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
                      <Label className="mb-2">Recurring Slots</Label>
                      <div className="flex flex-wrap gap-2">
                        {recurringSpots.data.map((spot) => (
                          <Button
                            variant={
                              selectedSpot === spot.id ? "default" : "outline"
                            }
                            onClick={() => {
                              setSelectedSpot(spot.id);
                            }}
                          >
                            {spot.days
                              ?.map(
                                (day) =>
                                  DAYS_OF_WEEK.find((d) => d.value === day)
                                    ?.label,
                              )
                              .join(", ")}{" "}
                            at {format(new Date(spot.startTime ?? ""), "HH:mm")}
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
                  <Button type="button" onClick={handleAddRecurringPost}>
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
                              <Label htmlFor="addFinisher">Add finisher</Label>
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
                                <Label htmlFor={`posts.0.twitterDirectLink`}>
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
                  <Button type="button" onClick={handleCustomSchedulePost}>
                    Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                              <Label htmlFor="addFinisher">Add finisher</Label>
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
                                <Label htmlFor={`posts.0.twitterDirectLink`}>
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
                      <Label className="mb-2">Time Slots</Label>
                      <div className="flex flex-wrap gap-2">
                        {nextSpots.data.map((spot) => (
                          <Button
                            variant={
                              selectedSpot === spot.id ? "default" : "outline"
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
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleSchedulePostToSlot}>
                    Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                              <Label htmlFor="addFinisher">Add finisher</Label>
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
                                <Label htmlFor={`posts.0.twitterDirectLink`}>
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
                  <Button type="button" onClick={handlePostNow}>
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
