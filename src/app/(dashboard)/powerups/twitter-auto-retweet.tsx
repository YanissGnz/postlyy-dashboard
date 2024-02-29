import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { useAppDispatch } from "@/redux/hooks";
import { openModal } from "@/redux/slices/modalsSlice";
import { type TPowerups } from "@/types/TPowerups";
import React, { useCallback } from "react";

type Props = {
  autoRetweetLinks: TPowerups["autoRetweetLinks"];
};

export default function TwitterAutoRetweet({ autoRetweetLinks }: Props) {
  const dispatch = useAppDispatch();

  const handleOpenSettings = useCallback(() => {
    dispatch(
      openModal({
        id: "twitter-auto-retweet",
        data: {
          autoRetweetLinks,
        },
      }),
    );
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Iconify icon="simple-icons:x" />X (Twitter) Auto Retweet
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Automatically retweet another Twitter account (e.g. company account)
          when it tweets through Postlyy.
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        <Button onClick={handleOpenSettings} variant="link">
          Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
