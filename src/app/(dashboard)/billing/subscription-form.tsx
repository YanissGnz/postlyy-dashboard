"use client";

import React, { useCallback } from "react";
import { format, isAfter } from "date-fns";
import { Spinner } from "@/components/ui/Spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionSettingsQuery,
} from "@/redux/api/user/subscription/apiSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SubscriptionForm() {
  const {
    data: subscriptionSettings,
    isLoading: isSubscriptionSettingsLoading,
    isSuccess: isSubscriptionSettingsSuccess,
    refetch,
  } = useGetSubscriptionSettingsQuery();

  const [cancelSubscription, { isLoading: isCancelLoading }] =
    useCancelSubscriptionMutation();

  const handleCancelSubscription = useCallback(() => {
    cancelSubscription()
      .unwrap()
      .then(() => {
        toast.success("Subscription canceled successfully");
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  }, []);

  return isSubscriptionSettingsLoading ? (
    <div className="flex h-56 w-full items-center justify-center">
      <Spinner />
    </div>
  ) : isSubscriptionSettingsSuccess ? (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl">Plan</CardTitle>
          <CardDescription>
            {subscriptionSettings?.data.isPendingDeletion && "Pending deletion"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid w-full grid-cols-3 ">
            <p>Plan</p>
            <p className="col-span-2 font-semibold">
              {subscriptionSettings?.data.tier === 0
                ? "Basic"
                : subscriptionSettings?.data.tier === 1
                  ? "Pro"
                  : "Expert"}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Price</p>
            <p className="col-span-2 font-semibold">
              {Math.round(subscriptionSettings.data.subscriptionPrice * 100) /
                100}{" "}
              ${subscriptionSettings?.data.isTrial && "(Free trail)"}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Seats</p>
            <p className="col-span-2 font-semibold">
              {subscriptionSettings?.data.seats}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Start Date</p>
            <p className="col-span-2 font-semibold">
              {format(
                new Date(subscriptionSettings?.data?.payingDate ?? ""),
                "PPPP",
              )}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Renewal Date</p>
            <p className="col-span-2 font-semibold">
              {format(
                new Date(subscriptionSettings?.data?.renewalDate ?? ""),
                "PPPP",
              )}
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            {!subscriptionSettings?.data.isPendingDeletion &&
              isAfter(
                new Date(),
                new Date(subscriptionSettings?.data.renewalDate ?? ""),
              ) && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isCancelLoading}
                  loading={isCancelLoading}
                >
                  Cancel Plan
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subscriptionSettings?.data.history.map((sub) => (
            <div className="flex items-start justify-between">
              <p>{format(new Date(sub.dateOfPayment), "dd MMM yyyy")}</p>
              <p>
                {sub.seatsPaid} {sub.seatsPaid === 1 ? "seat" : "seats"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  ) : (
    <Card className="flex h-56 flex-col items-center justify-center gap-5">
      <h1 className="text-xl font-semibold text-destructive">
        Something went wrong
      </h1>
      <Button variant="outline" onClick={refetch}>
        Try again
      </Button>
    </Card>
  );
}
