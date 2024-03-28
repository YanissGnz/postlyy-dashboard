"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import Iconify from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
// utils

import { useResetForgottenPasswordMutation } from "@/redux/api/user/auth/apiSlice";
import { ROUTES } from "@/routes";
import { useEffect } from "react";
import { toast } from "sonner";

export const confirmEmailSchema = z
  .object({
    code: z.string().min(6),
    email: z.string().email(),
    newPassword: z.string().min(6).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password and confirm password must be same",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const [resetForgottenPassword, { isLoading }] =
    useResetForgottenPasswordMutation();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const urlEmail = searchParams?.get("email");
  const urlCode = searchParams?.get("code");

  const form = useForm<z.infer<typeof confirmEmailSchema>>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: urlEmail ?? "",
      code: urlCode ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof confirmEmailSchema>) {
    const { email, code, newPassword } = values;
    await resetForgottenPassword({ email, code, newPassword })
      .unwrap()
      .then(() => {
        toast.success("Password reset successfully");
        push(ROUTES.login);
      })
      .catch((e: { data: string[] }) => {
        console.log("🚀 ~ file: form.tsx:51 ~ onSubmit ~ e:", e);
        if (e.data.includes("InvalidToken")) toast.error("Invalid Code");
        else toast.error("Something went wrong");
      });
  }

  useEffect(() => {
    form.handleSubmit(onSubmit);
  }, [urlEmail, urlCode]);

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
        />{" "}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter the code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter the new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{" "}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm the new password"
                  {...field}
                />
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
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
