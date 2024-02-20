"use client";

import React, { useCallback, useState } from "react";
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
  useUpgradeSubscriptionMutation,
} from "@/redux/api/user/subscription/apiSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ETiers } from "@/types/ETiers";
import { useBoolean } from "usehooks-ts";
import { type TErrorResponse } from "@/types/TErrorResponse";
import { isArray } from "lodash";

const PLANS = [
  {
    label: "Basic",
    value: ETiers.Basic,
  },
  {
    label: "Pro",
    value: ETiers.Pro,
  },
  {
    label: "Expert",
    value: ETiers.Expert,
  },
];

export default function SubscriptionForm() {
  const {
    data: subscriptionSettings,
    isLoading: isSubscriptionSettingsLoading,
    isSuccess: isSubscriptionSettingsSuccess,
    refetch,
  } = useGetSubscriptionSettingsQuery();

  const [cancelSubscription, { isLoading: isCancelLoading }] =
    useCancelSubscriptionMutation();
  const [upgradeSubscription, { isLoading: isUpgrading }] =
    useUpgradeSubscriptionMutation();
  const { value: isDialogOpen, setValue: setIsDialogOpen } = useBoolean(false);

  const [newTier, setNewTier] = useState<ETiers>(ETiers.Expert);

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

  const handleUpgradePlan = useCallback(() => {
    upgradeSubscription({ newTier: newTier })
      .unwrap()
      .then(() => {
        toast.success("Subscription upgraded successfully");
      })
      .catch((err: TErrorResponse) => {
        if (isArray(err)) toast.error(err[0]);
        else toast.error("Something went wrong");
      });
  }, [newTier]);

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
              {subscriptionSettings?.data.tier === ETiers.Basic
                ? "Basic"
                : subscriptionSettings?.data.tier === ETiers.Pro
                  ? "Pro"
                  : "Expert"}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Price</p>
            <p className="col-span-2 font-semibold">
              {Math.round(subscriptionSettings.data.subscriptionPrice * 100) /
                100}{" "}
              ${subscriptionSettings?.data.yearly ? "/year" : "/month"}
              {subscriptionSettings?.data.isTrial && " (Free trail)"}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Bought Seats</p>
            <p className="col-span-2 font-semibold">
              {subscriptionSettings?.data.seats}
            </p>
          </div>
          <div className="grid w-full grid-cols-3">
            <p>Used Seats</p>
            <p className="col-span-2 font-semibold">
              {subscriptionSettings?.data.usedSeats}
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
          <div className="grid w-full grid-cols-3">
            <p>Notification Date</p>
            <p className="col-span-2 font-semibold">
              {format(
                new Date(subscriptionSettings?.data?.notificationDate ?? ""),
                "PPPP",
              )}
            </p>
          </div>
          {subscriptionSettings?.data?.isPendingDeletion && (
            <div className="grid w-full grid-cols-3">
              <p>Renewal Date</p>
              <p className="col-span-2 font-semibold">
                {format(
                  new Date(subscriptionSettings?.data?.deletionDate ?? ""),
                  "PPPP",
                )}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-4">
            {subscriptionSettings?.data.tier !== ETiers.Expert && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Upgrade</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upgrade Plan</DialogTitle>
                    <DialogDescription>
                      Choose the plan that you want to upgrade to
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <Select
                      onValueChange={(value) =>
                        setNewTier(parseInt(value) as ETiers)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLANS.filter(
                          (plan) =>
                            parseInt(plan.value.toString()) >
                            parseInt(subscriptionSettings.data.tier.toString()),
                        ).map((plan, index) => (
                          <SelectItem key={index} value={plan.value.toString()}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpgradePlan}
                      disabled={isUpgrading}
                      loading={isUpgrading}
                    >
                      Upgrade
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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
          {subscriptionSettings.data.history.length > 0 ? (
            subscriptionSettings?.data.history.map((sub) => (
              <div className="flex items-start justify-between">
                <p>{format(new Date(sub.dateOfPayment), "dd MMM yyyy")}</p>
                <p>
                  {sub.seatsPaid} {sub.seatsPaid === 1 ? "seat" : "seats"}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-destructive">No history found</p>
            </div>
          )}
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
