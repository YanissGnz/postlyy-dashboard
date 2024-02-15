import { EPostSpotType } from "@/types/EPostSpotType";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBackgroundColor = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Draft:
      return "#FDE68A";
    case EPostSpotType.Evergreen:
      return "#6EE7B7";
    case EPostSpotType.Scheduled:
      return "#7fb7d9";
    case EPostSpotType.Recurring:
      return "#A5B4FC";
  }
};

export const getTextColor = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Draft:
      return "#1F2937";
    case EPostSpotType.Evergreen:
      return "#1F2937";
    case EPostSpotType.Scheduled:
      return "#000";
    case EPostSpotType.Recurring:
      return "#1F2937";
  }
};

export const getIcon = (type: EPostSpotType) => {
  switch (type) {
    case EPostSpotType.Draft:
      return "solar:sim-card-minimalistic-bold-duotone";
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
    case EPostSpotType.Draft:
      return "Draft";
    case EPostSpotType.Evergreen:
      return "Evergreen";
    case EPostSpotType.Scheduled:
      return "Scheduled";
    case EPostSpotType.Recurring:
      return "Recurring";
  }
};
