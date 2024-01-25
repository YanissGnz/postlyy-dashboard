import React from "react";
import { Spinner } from "./ui/Spinner";
import { cn } from "@/lib/utils";

export default function LoadingCard({
  className,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  return (
    <div
      className={cn("flex h-56 items-center justify-center", className)}
      {...props}
    >
      <Spinner />
    </div>
  );
}
