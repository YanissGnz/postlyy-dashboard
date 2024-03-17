import { type EPostSlotType } from "./EPostSlotType";

export type TCalendarEvent = {
  id: string;
  title: string;
  type: EPostSlotType;
  days: number[];
  start: string;
  startTime: string;
  forTwitter: boolean;
  forLinkedIn: boolean;
  postId: string;
};
