"use client";
// form
// motion
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

export default function ComingSoon() {
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
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5">
      <h1 className="text-5xl font-semibold">Coming Soon!</h1>
      <p className=" text-center text-muted-foreground">
        Postlyy is currently in development. <br /> We are working hard to bring
        you the best experience possible.
      </p>
      <p className=" text-center text-muted-foreground">
        Subscribe to our newsletter to get notified when we launch and much
        more.
      </p>
      {!isSuccess ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex ">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="rounded-e-none bg-background"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="rounded-s-none"
              disabled={isLoading}
            >
              Subscribe
            </Button>
          </form>{" "}
        </Form>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
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
  );
}
