"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Iconify from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fData } from "@/lib/formatNumber";
import { useUpdateAutoPlugMutation } from "@/redux/api/user/powerups/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactImageUploading, {
  type ImageListType,
} from "react-images-uploading";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";

const MAX_LENGTH = 280;
const TWITTER_MAX_IMAGES = 1;
const ACCEPTED_IMAGE_TYPES = ["jpg", "png"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const formSchema = z.object({
  autoPlugMessages: z.array(
    z.object({
      message: z.string().min(1).max(MAX_LENGTH),
      mediaFile: z.any().optional(),
    }),
  ),
  condition: z.number(),
  conditionValue: z.number(),
});

export default function TwitterAutoplugDialog() {
  const { list } = useAppSelector((state) => state.modals);
  const currentAccount = useAppSelector((state) => state.auth.currentAccount);
  const dispatch = useAppDispatch();

  const isDesktop = useMediaQuery("(min-width: 640px)");

  const [updateAutoPlug, { isLoading: isUpdatingAutoPlug }] =
    useUpdateAutoPlugMutation();

  const accountId = useMemo(() => {
    if (currentAccount) {
      return currentAccount.id;
    }
    return null;
  }, [currentAccount]);

  const [messageImages, setMessageImages] = useState<ImageListType[]>([[]]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoPlugMessages: [
        {
          message: "",
          mediaFile: "",
        },
      ],
      condition: 0,
      conditionValue: 0,
    },
  });

  const getMessageImages = useCallback(
    (index: number) => messageImages[index],
    [messageImages],
  );

  const handleAddMessage = useCallback(async () => {
    const messages = form.getValues("autoPlugMessages");
    form.setValue("autoPlugMessages", [
      // @ts-expect-error works
      ...messages,
      // @ts-expect-error works
      { message: "", mediaFile: null },
    ]);
    await form.trigger();
  }, [form]);

  const handleDeleteMessage = useCallback(
    (index: number) => async () => {
      const messages = form.getValues("autoPlugMessages");
      form.setValue(
        "autoPlugMessages",
        messages
          .filter((_, i) => i !== index)
          .map((message, i) => ({ ...message, id: `${i + 1}` })),
      );
      await form.trigger();
    },
    [form],
  );

  const onImagesUpload = useCallback(
    (index: number) => (imageList: ImageListType) => {
      setMessageImages((prev) => {
        const newState = [...prev];
        newState[index] = imageList;
        return newState;
      });

      const messages = form.getValues("autoPlugMessages");

      form.setValue(
        "autoPlugMessages",
        // @ts-expect-error works
        messages.map((message, i) => {
          if (i === index) {
            return {
              ...message,
              mediaFile: imageList[0]?.file ?? null,
            };
          }
          return message;
        }),
      );
    },
    [],
  );

  const onImageRemove = useCallback(
    (imageIndex: number, messageIndex: number) => () => {
      setMessageImages((prev) => {
        const newState = [...prev];
        newState[messageIndex] =
          (newState[messageIndex]?.filter(
            (_, i) => i !== imageIndex,
          ) as ImageListType) ?? [];
        return newState;
      });

      const messages = form.getValues("autoPlugMessages");

      form.setValue(
        "autoPlugMessages",
        // @ts-expect-error works
        messages.map((message, i) => {
          if (i === messageIndex) {
            return {
              ...message,
              mediaFile: null,
            };
          }
          return message;
        }),
      );
    },
    [],
  );

  const onSubmit = useCallback(async () => {
    await form.trigger();

    if (form.formState.isValid && accountId) {
      const data = new FormData();
      data.append("activate", "true");
      data.append("condition", form.getValues("condition").toString());
      data.append(
        "conditionValue",
        form.getValues("conditionValue").toString(),
      );
      form.getValues("autoPlugMessages").forEach((message, index) => {
        data.append(`autoPlugMessages[${index}].message`, message.message);
        if (message.mediaFile) {
          data.append(
            `autoPlugMessages[${index}].mediaFile`,
            message.mediaFile,
          );
        }
      });
      updateAutoPlug({
        accountId,
        body: data,
      })
        .unwrap()
        .then(() => {
          dispatch(closeModal("twitter-autoplug"));
          form.reset();
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    }
  }, [updateAutoPlug, form, accountId]);

  const content = useMemo(
    () => (
      <Form {...form}>
        <Tabs defaultValue="simple">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="simple">
            <div className="space-y-2">
              {form.getValues("autoPlugMessages").map((_, index) => (
                <div>
                  <FormField
                    control={form.control}
                    name={`autoPlugMessages.${index}.message`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your message here"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="flex items-center justify-between">
                          <p className="text-xs">
                            {field.value.length}/{MAX_LENGTH}
                          </p>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger>
                                <div>
                                  <ReactImageUploading
                                    multiple
                                    onChange={onImagesUpload(index)}
                                    maxNumber={TWITTER_MAX_IMAGES}
                                    value={getMessageImages(index) ?? []}
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
                                          `You can only upload ${TWITTER_MAX_IMAGES} images`,
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
                                            TWITTER_MAX_IMAGES
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
                                  </ReactImageUploading>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-center">
                                  {(getMessageImages(index) ?? []).length <
                                  4 ? (
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
                            {form.getValues("autoPlugMessages").length > 1 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <Iconify
                                      icon="solar:trash-bin-2-bold-duotone"
                                      className="text-destructive"
                                      fontSize={18}
                                      onClick={handleDeleteMessage(index)}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  <p className="text-center">Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />{" "}
                  {getMessageImages(index)?.map((image, i) => (
                    <div
                      key={i}
                      className="group relative w-fit overflow-hidden rounded"
                    >
                      <Image
                        src={image.dataURL!}
                        alt={i.toString()}
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
                              onClick={onImageRemove(i, index)}
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
                </div>
              ))}{" "}
              <Button variant="secondary" onClick={handleAddMessage}>
                Add another message
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="advanced">
            <div className="flex w-full items-center gap-4">
              <FormField
                control={form.control}
                name="conditionValue"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Enter a value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Likes</SelectItem>
                          <SelectItem value="1">Retweets</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Form>
    ),
    [
      form,
      onSubmit,
      isUpdatingAutoPlug,
      messageImages,
      getMessageImages,
      accountId,
    ],
  );

  if (isDesktop)
    return (
      <TooltipProvider>
        <Dialog
          open={list.some((modal) => modal.id === "twitter-autoplug")}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              dispatch(closeModal("twitter-autoplug"));
              form.reset();
              setMessageImages([[]]);
            }
          }}
        >
          <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Twitter Autoplug</DialogTitle>
              <DialogDescription>
                Automatically add a follow-up comment when your post hits a
                certain engagement level that you define.
              </DialogDescription>
            </DialogHeader>
            <div>{content}</div>
            <DialogFooter>
              <Button
                onClick={onSubmit}
                loading={isUpdatingAutoPlug}
                disabled={isUpdatingAutoPlug}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    );
  return (
    <TooltipProvider>
      <Drawer
        open={list.some((modal) => modal.id === "twitter-autoplug")}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) {
            dispatch(closeModal("twitter-autoplug"));
            form.reset();
            setMessageImages([[]]);
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Twitter Autoplug</DrawerTitle>
            <DrawerDescription>
              Automatically add a follow-up comment when your post hits a
              certain engagement level that you define.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">{content}</div>
          <DrawerFooter>
            <Button
              onClick={onSubmit}
              loading={isUpdatingAutoPlug}
              disabled={isUpdatingAutoPlug}
            >
              Save changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </TooltipProvider>
  );
}
