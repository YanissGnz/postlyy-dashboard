export type TPostHistory = {
  id: string;
  twitterId: string;
  linkedInId: string;
  reminder: string;
  draft: boolean;
  template: boolean;
  onTwitter: boolean;
  onLinkedIn: boolean;
  index: number;
  text: string;
  pollOptions: Array<string>;
  durationMinutes: number;
  twitterDirectLink: boolean;
  videoLink: string;
  gifLink: string;
  images: Array<string>;
  mainPostId: string;
};
