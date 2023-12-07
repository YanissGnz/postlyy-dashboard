import React from "react";
import Iconify from "./icon";
import { type IconProps } from "@iconify/react/dist/iconify.js";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: Omit<IconProps, "icon">) {
  return (
    <div>
      <Iconify
        {...props}
        className={cn(
          "mr-2 h-10 w-10 animate-spin text-muted-foreground",
          className,
        )}
        icon="ph:spinner-bold"
      />
    </div>
  );
}

export { Spinner };
