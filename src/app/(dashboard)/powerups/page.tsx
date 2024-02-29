"use client";

import { useMemo } from "react";

import { useAppSelector } from "@/redux/hooks";
import { useGetPowerupsQuery } from "@/redux/api/user/powerups/apiSlice";
import ErrorCard from "@/components/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import TwitterAutoPlug from "./twitter-auto-plug";
import TwitterAutoRetweet from "./twitter-auto-retweet";
import SelfRetweet from "./self-retweet";

export default function PowerupsPage() {
  const { currentAccount } = useAppSelector((state) => state.auth);

  const accountId = useMemo(() => currentAccount?.id, [currentAccount?.id]);

  const {
    data: powerups,
    isLoading,
    isSuccess,
    refetch,
  } = useGetPowerupsQuery(accountId!, {
    skip: !accountId,
    refetchOnMountOrArgChange: true,
  });

  return isLoading ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  ) : isSuccess ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <TwitterAutoPlug autoPlug={powerups.data.autoPlug} />
      <TwitterAutoRetweet autoRetweetLinks={powerups.data.autoRetweetLinks} />
      <SelfRetweet selfRetweet={powerups.data.selfRetweet} />
    </div>
  ) : (
    <ErrorCard title="Something went wrong" refetchFunction={refetch} />
  );
}
