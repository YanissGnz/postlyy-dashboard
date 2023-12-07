"use client";

import React from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSubscriptionSettingsQuery } from "@/redux/api/user/subscription/apiSlice";

export default function SubscriptionForm() {
  const {
    data: subscriptionSettings,
    isLoading: isSubscriptionSettingsLoading,
    isFetching: isSubscriptionSettingsFetching,
  } = useGetSubscriptionSettingsQuery();

  return (
    <Card className="w-full">
      {isSubscriptionSettingsLoading ? (
        <div className="flex h-56 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <CardContent className="p-4">s</CardContent>
      )}
    </Card>
  );
}
