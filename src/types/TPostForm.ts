import { z } from "zod";

export type TPost = {
  id?: string | null;
  index: number;
  text: string;
  poll: {
    durationMins: number;
    options: Array<string>;
  } | null;
  twitterDirectLink: boolean;
  gif: File | string | null;
  images: Array<File>;
  gifLink: string | null;
  imageLinks: string[];
  createdAt?: string | null;
};

export type TPostForm = {
  onTwitter: boolean;
  onLinkedIn: boolean;
  asEvergreen: boolean;
  scheduleDate: string;
  isDraft: boolean;
  isTemplate: boolean;
  addFinisher: boolean;
  posts: TPost[];
};

export const postFormSchema = z.object({
  onTwitter: z.boolean(),
  onLinkedIn: z.boolean(),
  asEvergreen: z.boolean(),
  scheduleDate: z.string(),
  isDraft: z.boolean(),
  isTemplate: z.boolean(),
  addFinisher: z.boolean(),
  posts: z.array(
    z.object({
      id: z.string().optional().nullable(),
      index: z.number(),
      text: z.string().min(1).max(280),
      poll: z
        .object({
          durationMins: z.number(),
          options: z.array(z.string().min(1)).min(2),
        })
        .optional()
        .nullable(),
      twitterDirectLink: z.boolean(),
      gif: z.any().optional().nullable(),
      images: z.array(z.any()),
      gifLink: z.string().optional().nullable(),
      imageLinks: z.array(z.string()),
      createdAt: z.string().optional().nullable(),
    }),
  ),
});
