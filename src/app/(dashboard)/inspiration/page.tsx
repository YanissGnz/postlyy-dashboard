"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { useGenrateInspirationMutation } from "@/redux/api/inspiration/apiSlice";
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
import { useForm } from "react-hook-form";
import { TypeAnimation } from "react-type-animation";
import { z } from "zod";

const inspirationSchema = z.object({
  postType: z.nativeEnum(EInspirationPostType),
  formality: z.nativeEnum(EInspirationFormality),
  tone: z.nativeEnum(EInspirationTone),
  type: z.nativeEnum(EInspirationType),
  audience: z.string(),
  context: z.string(),
});

export default function Inspiration() {
  const [generateInspiration, { isLoading, data, isSuccess }] =
    useGenrateInspirationMutation();

  const form = useForm<z.infer<typeof inspirationSchema>>({
    resolver: zodResolver(inspirationSchema),
  });

  async function onSubmit(values: z.infer<typeof inspirationSchema>) {
    await generateInspiration(values).unwrap();
  }

  return (
    <div className="space-y-4 pb-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Post Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
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
                    This will determine the type of post
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
                <FormItem className="md:col-span-3">
                  <FormLabel>Audience</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select targer audience" />
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

      <div className="">
        {isLoading && (
          <div className="space-y-2">
            <p className="text-center text-muted-foreground">
              Generating inspiration based on the provided information. Please
              wait...
            </p>
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        )}
        {isSuccess && (
          <div className="space-y-2">
            <p className="text-center text-muted-foreground">
              Here is the generated inspirations based on the provided
              informations ✨
            </p>
            {data?.data.content.map((text, i) => (
              <div key={i} className="rounded-lg border p-2">
                <TypeAnimation
                  sequence={[text]}
                  wrapper="span"
                  speed={99}
                  cursor={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
