"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBoolean } from "usehooks-ts";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ROUTES } from "@/routes";
import { env } from "@/env";
import { useCallback, useEffect } from "react";

export const confirmEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6),
});

export default function ConfirmEmailForm() {
  const { setFalse, setTrue, value: isLoading } = useBoolean(false);

  const searchParams = useSearchParams();
  const { push } = useRouter();

  const urlEmail = searchParams.get("email");
  const urlCode = searchParams.get("code");

  const form = useForm<z.infer<typeof confirmEmailSchema>>({
    resolver: zodResolver(confirmEmailSchema),
    defaultValues: {
      email: urlEmail ?? "",
      code: urlCode ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof confirmEmailSchema>) {
    const { email, code } = values;
    setTrue();
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASEURL}/api/Authentication/EmailConfirmation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      },
    );

    if (response.ok) {
      push(`${ROUTES.login}?email=${email}`);
    } else {
      alert("Something went wrong");
    }

    setFalse();
  }

  const handleResend = useCallback(async () => {
    const { email } = form.getValues();

    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Email is required",
      });
      return;
    }

    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASEURL}/api/Authentication/ResendConfirmation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      },
    );

    if (response.ok) {
      alert("Email sent successfully");
    } else {
      alert("Something went wrong");
    }
  }, [form, urlEmail]);

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
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter the 6 digit code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-2 text-end">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <Button
              variant="link"
              className="px-1"
              onClick={handleResend}
              type="button"
            >
              Resend
            </Button>
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && (
            <Iconify
              icon="ph:spinner-bold"
              className="mr-2 h-4 w-4 animate-spin"
            />
          )}
          Confirm
        </Button>
      </form>
    </Form>
  );
}
