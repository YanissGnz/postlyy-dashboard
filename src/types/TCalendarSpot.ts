import { z } from "zod";

export const calendarSpotSchema = z
  .object({
    type: z.number(),
    title: z.string(),
    start: z.string().optional().nullable(),
    forTwitter: z.boolean(),
    forLinkedIn: z.boolean(),
    postId: z.string().optional().nullable(),
    daysOfWeek: z.array(z.number()).optional().nullable(),
    startTime: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      return !(
        data.type === 3 &&
        (data.startTime === "" ||
          data.startTime === null ||
          data.startTime === undefined)
      );
    },
    {
      message: "Start time is required for recurring posts.",
      path: ["startTime"],
    },
  )
  .refine((data) => !(data.type === 3 && data.daysOfWeek?.length === 0), {
    message: "Days of week are required for recurring posts.",
    path: ["daysOfWeek"],
  });

export type TCalendarSpot = z.infer<typeof calendarSpotSchema>;
