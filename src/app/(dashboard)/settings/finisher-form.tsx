"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
// api
import {
  useGetFinisherQuery,
  useUpdateFinisherMutation,
} from "@/redux/api/user/profile/apiSlice";
// types
import { finisherSchema, type TFinisher } from "@/types/TFinisher";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Iconify from "@/components/ui/icon";
import Image from "@/components/ui/image";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fData } from "@/lib/formatNumber";
import ReactImageUploading, {
  type ImageListType,
} from "react-images-uploading";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = ["jpg", "png"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export default function FinisherForm() {
  const {
    data: finisher,
    isLoading: isFinisherLoading,
    isFetching: isFinisherFetching,
  } = useGetFinisherQuery();
  const [updateFinisher, { isLoading: isUpdateFinisherLoading }] =
    useUpdateFinisherMutation();

  const [finisherImage, setFinisherImage] = useState<ImageListType>([]);

  const defaultValues = useMemo(() => {
    if (finisher) return finisher.data;
    return {
      finisherText: "",
      finisherImage: "",
    };
  }, [finisher, isFinisherFetching, isFinisherLoading]);

  const form = useForm<TFinisher>({
    resolver: zodResolver(finisherSchema),
    defaultValues,
  });

  useEffect(() => {
    if (finisher) {
      form.reset(defaultValues);
    }
  }, [finisher, isFinisherLoading, isFinisherFetching]);

  function onSubmit(values: TFinisher) {
    const formData = new FormData();
    formData.append("finisherText", values.finisherText);
    formData.append("finisherImage", values.finisherImage as File);

    updateFinisher(formData)
      .unwrap()
      .then(() => {
        form.reset(values);
        toast.success("Finisher updated successfully");
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  const onImagesUpload = useCallback(
    (imageList: ImageListType) => {
      console.log("🚀 ~ FinisherForm ~ imageList:", imageList);
      const images = imageList.map((image) => image.file);
      const image = images[0];
      if (image) {
        setFinisherImage(imageList);
        form.setValue("finisherImage", image);
      }
    },
    [form],
  );

  const onImageRemoveImage = useCallback(() => {
    setFinisherImage([]);
    form.setValue("finisherImage", "");
  }, [form]);

  return (
    <TooltipProvider>
      <Card className="w-full">
        {isFinisherLoading ? (
          <div className="flex h-56 w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <CardContent className="p-4">
            <Form {...form}>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="finisherText"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your finisher text"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                {finisherImage[0]?.dataURL && (
                  <div className="group relative w-fit overflow-hidden rounded">
                    <Image
                      src={finisherImage[0].dataURL}
                      alt={finisherImage[0].file?.name ?? "Finisher image"}
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
                            onClick={onImageRemoveImage}
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
                )}
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger>
                      <div>
                        <ReactImageUploading
                          onChange={onImagesUpload}
                          value={finisherImage}
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
                            }
                          }}
                        >
                          {({ onImageUpload }) => (
                            <div className="upload__image-wrapper">
                              <Button
                                size="icon"
                                type="button"
                                variant="ghost"
                                onClick={onImageUpload}
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
                      <p className="text-center">Add photo</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  type="submit"
                  disabled={isUpdateFinisherLoading}
                  loading={isUpdateFinisherLoading}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Update Finisher
                </Button>
              </div>
            </Form>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
