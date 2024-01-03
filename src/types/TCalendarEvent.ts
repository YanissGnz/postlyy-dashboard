import { type EPostSpotType } from "./EPostSpotType";

export type TCalendarEvent = {
  id: string;
  title: string;
  type: EPostSpotType;
  days: number[];
  start: string;
  startTime: string;
  forTwitter: boolean;
  forLinkedIn: boolean;
  postId: string;
};
