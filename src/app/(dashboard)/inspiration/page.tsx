"use client";
import ErrorCard from "@/components/error-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { useGenrateInspirationMutation } from "@/redux/api/inspiration/apiSlice";
import {
  useGetBestPostByIdMutation,
  useGetBestPostsQuery,
} from "@/redux/api/post/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import {
  EInspirationFormality,
  EInspirationPostType,
  EInspirationTone,
  EInspirationType,
  InspirationAudienceOptions,
  InspirationFormalityOptions,
  InspirationPostTypeOptions,
  InspirationToneOptions,
  InspirationTypeOptions,
} from "@/types/EInspiration";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import InspirationResponse from "./inspiration-response";

const inspirationSchema = z.object({
  postType: z.nativeEnum(EInspirationPostType, {
    required_error: "Please select a post length",
  }),
  formality: z.nativeEnum(EInspirationFormality, {
    required_error: "Please select a formality",
  }),
  tone: z.nativeEnum(EInspirationTone, {
    required_error: "Please select a tone",
  }),
  type: z.nativeEnum(EInspirationType, {
    required_error: "Please select a generation source",
  }),
  audience: z.string().min(1, "Please select a target audience"),
  includeEmojis: z.boolean(),
  includeHashTags: z.boolean(),
  context: z.string().min(1, "Please enter a context"),
});

export default function Inspiration() {
  const [generateInspiration, { isLoading, data, isSuccess }] =
    useGenrateInspirationMutation();
  const [getBestPost] = useGetBestPostByIdMutation();
  const currentAccount = useAppSelector((state) => state.auth.currentAccount);

  const pagination = usePagination();

  const form = useForm<z.infer<typeof inspirationSchema>>({
    resolver: zodResolver(inspirationSchema),
    defaultValues: {
      includeEmojis: false,
      includeHashTags: false,
    },
  });

  const {
    data: bestPosts,
    isLoading: isPostsLoading,
    isSuccess: isPostSuccess,
    refetch,
  } = useGetBestPostsQuery(
    {
      otherUsers: false,
      PageNumber: pagination.pageNumber,
      PageSize: pagination.pageSize,
    },
    {
      skip:
        Boolean(form.watch("type")) &&
        form.watch("type") === EInspirationType.FromKeywords,
    },
  );

  async function onSubmit(values: z.infer<typeof inspirationSchema>) {
    window.scrollTo(0, document.body.scrollHeight);
    await generateInspiration(values).unwrap();
  }

  const handleImportPost = useCallback(
    (id: string) => () => {
      const getBestPostPromise = getBestPost(id).unwrap();

      toast.promise(getBestPostPromise, {
        loading: "Fetching post...",
        success: async (data) => {
          const text = data.data.posts.map((post) => post.text).join("\n");

          form.setValue("context", text);

          return "Fetched post!";
        },
        error: "Failed to fetch post",
      });
    },
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-4 pb-5 md:grid-cols-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Post Length</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InspirationPostTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will determine the length of the post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="formality"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Formality</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl className="md:col-span-2">
                      <SelectTrigger>
                        <SelectValue placeholder="Select formality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InspirationFormalityOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will determine the formality of the post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Tone</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InspirationToneOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will determine the tone of the post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Generation Source</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select generation source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InspirationTypeOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will determine the source of the post generation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 md:col-span-3">
                  <FormLabel>Audience</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {InspirationAudienceOptions.map((group) => (
                        <SelectGroup>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will determine the target audience of the post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="includeEmojis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include emojis in the generated content
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="includeHashTags"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Include hashtags in the generated content
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context</FormLabel>
                <Textarea
                  {...field}
                  placeholder="Enter context of the post here..."
                />
                <FormDescription>
                  Please enter as much context as possible to help with the post
                  generation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full justify-end ">
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {isLoading
                ? "Generating..."
                : isSuccess
                  ? "Regenerate"
                  : "Generate"}
            </Button>
          </div>
        </form>
      </Form>
      {Boolean(form.watch("type")) &&
        form.watch("type") !== EInspirationType.FromKeywords && (
          <div className="space-y-2">
            <h1 className="text-muted-foreground">
              You can import a post from your old posts to generate inspiration
            </h1>
            <TooltipProvider>
              <ScrollArea className="mt-2 h-[80vh]">
                {isPostsLoading ? (
                  <div className="h-full space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-36 w-full" />
                    ))}
                  </div>
                ) : isPostSuccess ? (
                  bestPosts.data.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        {bestPosts.data.map((post) => (
                          <div className="mb-4 flex flex-col rounded border">
                            <div className="p-2">
                              <div className="my-3 flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={currentAccount?.photoUrl ?? ""}
                                    alt={`@${currentAccount?.username}`}
                                    className="object-cover"
                                  />
                                  <AvatarFallback>
                                    {currentAccount?.username
                                      ?.slice(0, 2)
                                      .toUpperCase() ?? ""}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-semibold">''</p>
                                  <p className="text-xs text-gray-500">
                                    @
                                    {currentAccount?.username
                                      .toLowerCase()
                                      .split(" ")
                                      .join("")}
                                  </p>
                                </div>
                              </div>
                              <p>{post.text}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {post.images.map((image, index) => (
                                  <Image
                                    key={index}
                                    src={image}
                                    alt={`Image ${index}`}
                                    height={64}
                                    width={64}
                                    className="h-16 w-16 rounded object-cover"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t px-1">
                              <div className="flex items-center gap-2 divide-x">
                                {" "}
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 p-1">
                                      <Iconify
                                        icon="solar:eye-bold-duotone"
                                        className="text-blue-500"
                                        fontSize={18}
                                      />
                                      <span>{post.impressions}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-center">
                                      Impressions and views
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 p-1">
                                      <Iconify
                                        icon="solar:heart-angle-bold-duotone"
                                        className="text-red-500"
                                        fontSize={18}
                                      />
                                      <span>{post.likes}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-center">Likes</p>
                                  </TooltipContent>
                                </Tooltip>{" "}
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 p-1">
                                      <Iconify
                                        icon="solar:chat-square-arrow-bold-duotone"
                                        className="text-blue-500"
                                        fontSize={18}
                                      />
                                      <span>{post.replies}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-center">
                                      Comments and replies
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center gap-1 p-1">
                                      <Iconify
                                        icon="fa6-solid:retweet"
                                        className="text-green-500"
                                        fontSize={18}
                                      />
                                      <span>{post.retweets}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-center">
                                      Retweets and shares
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="gap2 flex items-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleImportPost(post.id)}
                                  className="my-1"
                                >
                                  <Iconify
                                    icon="solar:square-forward-bold-duotone"
                                    className="me-1 text-foreground/80"
                                    fontSize={18}
                                  />
                                  Import
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center">
                      <div className="text-muted-foreground">
                        No posts found
                      </div>
                    </div>
                  )
                ) : (
                  <ErrorCard refetchFunction={refetch} />
                )}
              </ScrollArea>
            </TooltipProvider>
            {bestPosts?.data && bestPosts?.data?.length > 10 && (
              <DataTablePagination
                {...pagination}
                totalPages={bestPosts?.totalPages ?? 1}
              />
            )}
          </div>
        )}

      <div
        className={cn(
          "min-h-[300px] rounded-lg border p-2",
          Boolean(form.watch("type")) &&
            form.watch("type") !== EInspirationType.FromKeywords &&
            "md:col-span-2",
        )}
      >
        {isLoading ? (
          <div className="relative flex h-full flex-col justify-center gap-2 ">
            <Skeleton className="h-full w-full" />
            <p className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 text-center text-muted-foreground">
              Generating inspiration based on the provided informations 🙌...
            </p>
          </div>
        ) : isSuccess ? (
          <div className="flex h-full flex-col space-y-2 divide-y">
            {data?.data.content.map((content, index) => (
              <InspirationResponse key={index} text={content ?? ""} />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-center">
              Once the inspiration ✨ is generated, it will be displayed here 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
