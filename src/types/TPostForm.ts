import { z } from "zod";

export type TPost = {
  index: number;
  text: string;
  poll: {
    durationMins: number;
    options: Array<string>;
  } | null;
  twitterDirectLink: boolean;
  gif: string;
  images: Array<string>;
};

export type TPostForm = {
  onTwitter: boolean;
  onLinkedIn: boolean;
  asEvergreen: boolean;
  ScheduleDate: string;
  isDraft: boolean;
  posts: TPost[];
};

export const postFormSchema = z.object({
  onTwitter: z.boolean(),
  onLinkedIn: z.boolean(),
  asEvergreen: z.boolean(),
  ScheduleDate: z.string(),
  isDraft: z.boolean(),
  posts: z.array(
    z.object({
      index: z.number(),
      text: z.string().min(1),
      poll: z
        .object({
          durationMins: z.number(),
          options: z.array(z.string().min(1)).min(2),
        })
        .optional()
        .nullable(),
      twitterDirectLink: z.boolean(),
      gif: z.string(),
      images: z.array(z.string()),
    }),
  ),
});
