"use client";

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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateSelfRetweetMutation } from "@/redux/api/user/powerups/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/modalsSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  condition: z.number(),
  conditionValue: z.number().min(1),
  delayHours: z.number().min(1),
});

export default function SelfRetweetDialog() {
  const { list } = useAppSelector((state) => state.modals);
  const currentAccount = useAppSelector((state) => state.auth.currentAccount);
  const dispatch = useAppDispatch();

  const [updateSelfRetweet, { isLoading: isUpdatingSelfRetweet }] =
    useUpdateSelfRetweetMutation();

  const accountId = useMemo(() => {
    if (currentAccount) {
      return currentAccount.id;
    }
    return null;
  }, [currentAccount]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delayHours: 0,
      condition: 0,
      conditionValue: 1,
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (accountId) {
        const promise = updateSelfRetweet({
          accountId,
          body: {
            activate: true,
            condition: values.condition,
            conditionValue: values.conditionValue,
            delayHours: values.delayHours,
          },
        }).unwrap();

        toast.promise(promise, {
          loading: "Updating auto repost...",
          success: () => {
            dispatch(closeModal("self-retweet"));
            return "Auto repost updated!";
          },
          error: "Something went wrong!",
        });
      }
    },
    [accountId],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {" "}
        <Dialog
          open={list.some((modal) => modal.id === "self-retweet")}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              dispatch(closeModal("self-retweet"));
              form.reset();
            }
          }}
        >
          <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Auto Repost</DialogTitle>
              <DialogDescription>
                Automatically repost your own posts after a certain period of
                time.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <div className="flex w-full items-start gap-4">
                <FormField
                  control={form.control}
                  name="conditionValue"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Condition Value</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a value"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel> Condition</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a verified email to display" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Likes</SelectItem>
                            <SelectItem value="1">Retweets</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="delayHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay in hours</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a value"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => form.handleSubmit(onSubmit)()}
                loading={isUpdatingSelfRetweet}
                disabled={isUpdatingSelfRetweet}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
