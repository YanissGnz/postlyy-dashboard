export type TDraft = {
  id: string;
  index: number;
  text: string;
  poll: {
    durationMins: number;
    options: Array<string>;
  } | null;
  twitterDirectLink: boolean;
  gif: File | null;
  gifLink: string | null;
  images: File[] | null;
  imageLinks: Array<string>;
  createdAt: string;
};
