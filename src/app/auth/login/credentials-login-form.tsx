"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useBoolean } from "usehooks-ts";
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
import { ROUTES } from "@/routes";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function EnterpriseLoginForm() {
  const { setFalse, setTrue, value: isLoading } = useBoolean(false);

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");
  const urlEmail = searchParams.get("email");

  const { push } = useRouter();

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

    const response = await signIn("c", {
      email,
      password,
      redirect: false,
    });

    if (response?.ok) {
      push(callbackUrl ?? ROUTES.home);
    } else if (response?.error === "CredentialsSignin") {
      form.setError("email", {
        type: "manual",
        message: "Invalid email or password",
      });
      form.setError("password", {
        type: "manual",
        message: "Invalid email or password",
      });
    } else if (response?.error === "USER_NOT_CONFIRMED") {
      push(`${ROUTES.confirmEmail}?email=${email}`);
    } else if (response?.error === "USER_NOT_FOUND") {
      form.setError("email", {
        type: "manual",
        message: "User not found",
      });
    } else if (response?.error === "WRONG_PASS") {
      form.setError("password", {
        type: "manual",
        message: "Wrong password",
      });
    } else {
      alert("Something went wrong");
    }
    setFalse();
  }

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
  );
}
