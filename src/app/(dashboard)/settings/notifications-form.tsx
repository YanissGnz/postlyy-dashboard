"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// api
import {
  useGetNotificationsSettingsQuery,
  useUpdateNotificationsSettingsMutation,
} from "@/redux/api/user/notifications-settings/apiSlice";
// types
import {
  notificationsSettingsSchema,
  type TNotificationsSettings,
} from "@/types/TNotificationsSettings";
// components
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export default function NotificationsForm() {
  const {
    data: notificationsSettings,
    isLoading: isNotificationsSettingsLoading,
    isFetching: isNotificationsSettingsFetching,
  } = useGetNotificationsSettingsQuery();

  const [
    updateNotificationsSettings,
    { isLoading: isUpdateNotificationsSettingsLoading },
  ] = useUpdateNotificationsSettingsMutation();

  const defaultValues = useMemo(() => {
    if (notificationsSettings) return notificationsSettings.data;
    return {
      whenPostsFailToPublish: true,
      weeklyReport: true,
      dailyReport: true,
      whenQueueIsEmpty: true,
      renewalNotifications: true,
      thanksForSubscription: true,
    };
  }, [
    notificationsSettings,
    isNotificationsSettingsFetching,
    isNotificationsSettingsLoading,
  ]);

  const form = useForm<TNotificationsSettings>({
    resolver: zodResolver(notificationsSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (notificationsSettings) form.reset(defaultValues);
  }, [
    notificationsSettings,
    isNotificationsSettingsLoading,
    isNotificationsSettingsFetching,
  ]);

  function onSubmit(values: TNotificationsSettings) {
    updateNotificationsSettings(values)
      .unwrap()
      .then(() => {
        form.reset(values);
        toast.success("Notifications settings updated successfully");
      })
      .catch((err) => {
        toast.error("Something went wrong");
        console.log(err);
      });
  }

  return (
    <Card className="w-full">
      {isNotificationsSettingsLoading ? (
        <div className="flex h-56 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="dailyReport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Daily reports</FormLabel>
                      <FormDescription>
                        Get a daily report of your account activity
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyReport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Weekly reports</FormLabel>
                      <FormDescription>
                        Get a weekly report of your account activity
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whenQueueIsEmpty"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>When queue is empty</FormLabel>
                      <FormDescription>
                        Get notified when your queue is empty
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whenPostsFailToPublish"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>When posts fail to publish</FormLabel>
                      <FormDescription>
                        Get notified when your posts fail to publish
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="renewalNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Renewal notifications</FormLabel>
                      <FormDescription>
                        Get notified when your subscription is about to expire
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thanksForSubscription"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Thanks for subscription</FormLabel>
                      <FormDescription>
                        Get a thank you message for subscribing
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isUpdateNotificationsSettingsLoading}
                loading={isUpdateNotificationsSettingsLoading}
              >
                Update
              </Button>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}
