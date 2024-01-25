"use client";

import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBoolean } from "usehooks-ts";
import Link from "next/link";
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
import { env } from "@/types/env";

export const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must be same",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const { setFalse, setTrue, value: isLoading } = useBoolean(false);

  const { push } = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    const { email, password, fullName } = values;
    setTrue();
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASE_URL}/api/Authentication/Register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      },
    );

    if (response.ok) {
      push(`${ROUTES.confirmEmail}?email=${email}`);
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
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
          Register
        </Button>
      </form>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href={ROUTES.login} className="font-medium text-primary">
            <Button variant="link" className="px-1" type="button">
              Login
            </Button>
          </Link>
        </p>
      </div>
    </Form>
  );
}
