"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// api
import { useSendFeedbackMutation } from "@/redux/api/user/auth/apiSlice";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import StarRatings from "react-star-ratings";
import { cn } from "@/lib/utils";

export const passwordSchema = z.object({
  stars: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export default function FeedbackForm() {
  const [sendFeedback, { isLoading: isSendingFeedback }] =
    useSendFeedbackMutation();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      stars: 0,
      comment: "",
    },
  });

  function onSubmit(values: z.infer<typeof passwordSchema>) {
    const { comment, stars } = values;
    sendFeedback({ comment, stars })
      .unwrap()
      .then(() => {
        form.reset();
        toast.success("Feedback sent, thank you!");
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="stars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Star rating</FormLabel>
                  <br />
                  <FormControl>
                    <StarRatings
                      rating={field.value}
                      starRatedColor="yellow"
                      changeRating={(newRating) => {
                        const e = {
                          target: {
                            value: newRating,
                            name: "stars",
                          },
                        };
                        field.onChange(e);
                      }}
                      starDimension="30px"
                      starHoverColor="yellow"
                      numberOfStars={5}
                      name="stars"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your feedback" {...field} />
                  </FormControl>
                  <FormDescription
                    className={cn(
                      field.value.length > 500 && "text-destructive",
                    )}
                  >
                    {field.value.length}/500
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSendingFeedback}
              loading={isSendingFeedback}
            >
              Send Feedback
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
