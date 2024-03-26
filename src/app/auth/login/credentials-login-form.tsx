"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useBoolean } from "usehooks-ts";
import * as z from "zod";
// components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { ROUTES } from "@/routes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { sentenceCase } from "change-case";
import { isString } from "lodash";
import { useState } from "react";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function EnterpriseLoginForm() {
  const { setFalse, setTrue, value: isLoading } = useBoolean(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");
  const urlEmail = searchParams.get("email");

  const { replace } = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: urlEmail ?? "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const { email, password } = values;
    setTrue();
    setError(null);
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.ok) {
      replace(callbackUrl ?? ROUTES.home);
    } else if (response?.error === "The User Was Not Found") {
      form.setError("email", {
        type: "manual",
        message: response?.error,
      });
    } else if (response?.error === "Wrong User Password") {
      form.setError("password", {
        type: "manual",
        message: response?.error,
      });
    } else if (response?.error === "The User Has Not Yet Confirmed His Email") {
      replace(`${ROUTES.confirmEmail}?email=${email}`);
    } else if (isString(response?.error)) {
      setError(sentenceCase(response?.error));
    }

    setFalse();
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>{" "}
                  <p className="text-xs text-gray-500">
                    Forgot your password?{" "}
                    <Link href={ROUTES.recoverPassword}>
                      <Button
                        variant="link"
                        className="px-1 text-xs"
                        type="button"
                      >
                        Recover password
                      </Button>
                    </Link>
                  </p>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <Iconify
                icon="ph:spinner-bold"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            Login
          </Button>
        </form>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href={ROUTES.register} className="font-medium text-primary">
              <Button variant="link" className="px-1" type="button">
                Sign up
              </Button>
            </Link>
          </p>
        </div>
      </Form>
    </>
  );
}
