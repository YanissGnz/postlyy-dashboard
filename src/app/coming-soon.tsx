"use client";

import { useSubscribeMutation } from "@/redux/api/newsLetterApi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Iconify from "@/components/ui/icon";
import { toast } from "sonner";
import BackgroundBeams from "./BackgroundBeams";

function ComingSoon() {
  const [subscribe, { isLoading, isSuccess }] = useSubscribeMutation();

  const formSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { email } = data;

    await subscribe({ email })
      .unwrap()
      .then(() => {
        form.reset();
        toast.success("Thank you for subscribing");
      });
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-black antialiased">
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="relative z-10 bg-gradient-to-b from-primary/50  to-primary bg-clip-text text-center font-sans text-lg  font-bold text-transparent md:text-7xl">
          Join the waitlist
        </h1>
        <p></p>
        <p className="relative z-10 mx-auto my-2 max-w-lg text-center text-sm text-neutral-500">
          Postlyy is currently in development. <br /> We are working hard to
          bring you the best experience possible.
          <br />
          Subscribe to our newsletter to get notified when we launch and much
          more.
        </p>
        {!isSuccess ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="z-10 mt-4 flex"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="z-10 w-full">
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        className=" rounded-e-none border border-neutral-800 bg-neutral-950 p-2 text-white placeholder:text-neutral-700 focus:ring-2 focus:ring-teal-500"
                      />
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="z-10 rounded-s-none"
                disabled={isLoading}
              >
                Subscribe
              </Button>
            </form>{" "}
          </Form>
        ) : (
          <div className="z-10 flex flex-col items-center justify-center gap-2">
            <Iconify
              icon="material-symbols:check-circle-rounded"
              width={60}
              className="text-green-500"
            />
            <p className="mb-10 max-w-xl text-center text-xl text-white">
              Thanks for subscribing! We're excited to share news, updates, and
              exclusive offers with you.
            </p>
          </div>
        )}
      </div>
      <BackgroundBeams />
    </div>
  );
}

export default ComingSoon;
