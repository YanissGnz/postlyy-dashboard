import { EDashboardCardType } from "@/types/EDashboardCardType";
import { EPostSpotType } from "@/types/EPostSpotType";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEventBackgroundColor = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Evergreen:
      return "#6EE7B7";
    case EPostSpotType.Scheduled:
      return "#7fb7d9";
    case EPostSpotType.Recurring:
      return "#A5B4FC";
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
