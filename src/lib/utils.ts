import { EDashboardCardType } from "@/types/EDashboardCardType";
import { EPostSpotType } from "@/types/EPostSpotType";
import { EProviders } from "@/types/EProviders";
import { type TAccount } from "@/types/TAccount";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEventBackgroundColor = (
  type: EPostSpotType,
  isDark: boolean,
) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return isDark ? "#165a3f" : "#6EE7B7";
    case EPostSpotType.Scheduled:
      return isDark ? "#1e5b80" : "#75cbff";
    case EPostSpotType.Recurring:
      return isDark ? "#8f2d00" : "#ff9867";
  }
};

export const getEventTWBackgroundColor = (
  type: EPostSpotType,
  isDark: boolean,
) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return isDark ? "bg-[#165a3f]" : "bg-[#6EE7B7]";
    case EPostSpotType.Scheduled:
      return isDark ? "bg-[#8f2d00]" : "bg-[#ff9867]";
    case EPostSpotType.Recurring:
      return isDark ? "bg-[#1e5b80]" : "bg-[#75cbff]";
  }
};

export const getEventTextColor = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return "#1F2937";
    case EPostSpotType.Scheduled:
      return "#000";
    case EPostSpotType.Recurring:
      return "#1F2937";
  }
};

export const getEventIcon = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return "solar:leaf-bold-duotone";
    case EPostSpotType.Scheduled:
      return "solar:calendar-mark-bold-duotone";
    case EPostSpotType.Recurring:
      return "solar:refresh-square-bold-duotone";
  }
};

export const getTypeName = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return "Evergreen";
    case EPostSpotType.Scheduled:
      return "Scheduled";
    case EPostSpotType.Recurring:
      return "Recurring";
  }
};

export const getDachboardCardMinWidth = (type: EDashboardCardType) => {
  switch (type) {
    case EDashboardCardType.Stat:
      return 2;
    case EDashboardCardType.Graph:
      return 6;
    case EDashboardCardType.Table:
      return 4;
    case EDashboardCardType.EventsCalendar:
      return 4;
    default:
      return 2;
  }
};

export const getDachboardCardMinHeight = (type: EDashboardCardType) => {
  switch (type) {
    case EDashboardCardType.Stat:
      return 4;
    case EDashboardCardType.Graph:
      return 8;
    case EDashboardCardType.Table:
      return 8;
    case EDashboardCardType.EventsCalendar:
      return 8;
    default:
      return 4;
  }
};

export const getProviderIcon = (type: EProviders) => {
  switch (type) {
    case EProviders.Linkedin:
      return "simple-icons:linkedin";
    case EProviders.Twitter:
      return "simple-icons:x";
  }
};

export const hasAccount = (accountType: EProviders, accounts?: TAccount[]) => {
  return Boolean(
    accounts?.find((account) => account.accountType === accountType),
  );
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getTimezonedDate = (date: string, timezone: string) => {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: timezone }),
  );
};

export const convertToUTC = (date: string | Date) => {
  return new Date(date).toISOString();
};
