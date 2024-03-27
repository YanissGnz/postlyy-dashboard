import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSetupEmailMutation } from "@/redux/api/user/auth/apiSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export default function EmailAlert({
  isOpened,
  setIsOpened,
}: {
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [setupEmail, { isLoading: isSetupLoading }] = useSetupEmailMutation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof emailSchema>) {
    setupEmail(values)
      .unwrap()
      .then(() => {
        form.reset(values);
        toast.success("Email setup successfully");
        setIsOpened(false);
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  if (isDesktop)
    return (
      <Dialog open={isOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your email is not setup yet!</DialogTitle>
            <DialogDescription>
              To ensure you receive important notifications, please setup your
              email address.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter your Email" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    loading={isSetupLoading}
                    disabled={isSetupLoading}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={isOpened}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Your email is not setup yet!</DrawerTitle>
          <DrawerDescription>
            To ensure you receive important notifications, please setup your
            email address.
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter your Email" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter>
                <Button
                  type="submit"
                  loading={isSetupLoading}
                  disabled={isSetupLoading}
                >
                  Confirm
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
