export type TRecurringPost = {
  type: number;
  title: string;
  daysOfWeek: Array<number>;
  forTwitter: boolean;
  forLinkedIn: boolean;
  startTime: Date | string;
  postId: string;
};
