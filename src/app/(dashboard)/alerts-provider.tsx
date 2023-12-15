import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSetupEmailMutation } from "@/redux/api/user/auth/apiSlice";
import { ROUTES } from "@/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useBoolean } from "usehooks-ts";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export default function AlertsProvider() {
  const { value: emailAlertOpen, setValue: setEmailAlertOpen } =
    useBoolean(false);

  const { value: passwordAlertOpen, setValue: setPasswordAlertOpen } =
    useBoolean(false);

  const session = useSession();

  const [setupEmail, { isLoading: isSetupLoading }] = useSetupEmailMutation();

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
        setEmailAlertOpen(false);
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      !session.data?.user.hasSetupEmail
    ) {
      setEmailAlertOpen(true);
    } else if (
      session.status === "authenticated" &&
      session.data?.user.hasToChangePassword
    ) {
      setPasswordAlertOpen(true);
    }
  }, [session]);

  return (
    <>
      <Dialog open={emailAlertOpen}>
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
      <AlertDialog open={passwordAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              You haven't setup your password yet!
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're using a temporary password, please change your password for
              security reasons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              asChild
              onClick={() => setPasswordAlertOpen(false)}
            >
              <Link href={ROUTES.settings + "?tab=password"}>
                Change password
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
