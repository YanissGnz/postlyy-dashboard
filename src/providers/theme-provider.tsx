"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Next13ProgressBar } from "next13-progressbar";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <Next13ProgressBar
        color="#1DA1F2"
        startPosition={0.3}
        stopDelayMs={200}
        height="4px"
        options={{ showSpinner: false }}
        showOnShallow
      />
      {children}
    </NextThemesProvider>
  );
}
