import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface ErrorCardProps {
  refetchFunction: () => void;
  title?: string;
  refetchText?: string;
}

export default function ErrorCard({
  refetchFunction,
  title,
  refetchText,
}: ErrorCardProps) {
  return (
    <div>
      <Card className="flex h-56 flex-col items-center justify-center gap-5">
        <h1 className="text-xl font-semibold text-destructive">
          {title ?? "Something went wrong"}
        </h1>
        <Button variant="outline" onClick={refetchFunction}>
          {refetchText ?? "Try again"}
        </Button>
      </Card>
    </div>
  );
}
