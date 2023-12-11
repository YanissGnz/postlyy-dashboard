"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
// components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Iconify from "@/components/ui/icon";
// utils

import { useEffect } from "react";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/redux/api/user/auth/apiSlice";

export const confirmEmailSchema = z.object({
  email: z.string().email(),
});

export default function RecoverPasswordForm() {
  const [forgetPassword, { isLoading }] = useForgotPasswordMutation();

  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email");

  const form = useForm<z.infer<typeof confirmEmailSchema>>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: urlEmail ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof confirmEmailSchema>) {
    const { email } = values;
    await forgetPassword({ email })
      .unwrap()
      .then(() => {
        toast.success("Email sent successfully");
      })
      .catch((e) => {
        console.log("🚀 ~ file: form.tsx:51 ~ onSubmit ~ e:", e);
        toast.error("Something went wrong");
      });
  }

  useEffect(() => {
    form.handleSubmit(onSubmit);
  }, [urlEmail]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && (
            <Iconify
              icon="ph:spinner-bold"
              className="mr-2 h-4 w-4 animate-spin"
            />
          )}
          Send email
        </Button>
      </form>
    </Form>
  );
}
