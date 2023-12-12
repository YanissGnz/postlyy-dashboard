"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Iconify from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useCallback } from "react";

export default function LayoutForm() {
  const { theme, setTheme } = useTheme();

  const handleChangeTheme = useCallback(
    (newTheme: string) => () => {
      setTheme(newTheme);
    },
    [theme],
  );

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h1 className="font-medium">Theme mode</h1>
          <p className="text-muted-foreground">
            Set the theme mode for your dashboard
          </p>
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              className={cn("h-16 w-16", theme === "light" && "bg-primary/20")}
              onClick={handleChangeTheme("light")}
            >
              <Iconify
                icon="solar:sun-2-bold-duotone"
                fontSize={22}
                className={cn(
                  theme === "light" ? "text-primary" : "text-foreground/80",
                )}
              />
            </Button>
            <Button
              variant="outline"
              className={cn("h-16 w-16", theme === "dark" && "bg-primary/30")}
              onClick={handleChangeTheme("dark")}
            >
              <Iconify
                icon="solar:moon-stars-bold-duotone"
                fontSize={22}
                className={cn(
                  theme === "dark" ? "text-primary" : "text-foreground/80",
                )}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
