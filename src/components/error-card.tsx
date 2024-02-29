import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ErrorCardProps {
  refetchFunction: () => void;
  title?: string;
  refetchText?: string;
  titleClassName?: string;
  className?: string;
}

export default function ErrorCard({
  refetchFunction,
  title,
  refetchText,
  titleClassName,
  className,
}: ErrorCardProps) {
  return (
    <Card
      className={cn(
        "flex h-56 flex-col items-center justify-center gap-5 p-4",
        className,
      )}
    >
      <h1
        className={cn(
          "text-center text-xl font-semibold text-destructive",
          titleClassName,
        )}
      >
        {title ?? "Something went wrong"}
      </h1>
      <Button variant="outline" onClick={refetchFunction}>
        {refetchText ?? "Try again"}
      </Button>
    </Card>
  );
}
