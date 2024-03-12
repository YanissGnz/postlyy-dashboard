import { z } from "zod";
import { EPostSpotType } from './EPostSpotType';

export const calendarSpotSchema = z
  .object({
    type: z.nativeEnum(EPostSpotType),
    title: z.string(),
    start: z.string(),
    forTwitter: z.boolean().optional().nullable(),
    forLinkedIn: z.boolean().optional().nullable(),
    postId: z.string().optional().nullable(),
    daysOfWeek: z.array(z.number()).optional().nullable(),
    startTime: z.string(),
  })
  .refine(
    (data) => {
      return !(
        data.type === EPostSpotType.Recurring &&
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
  .refine((data) => !(data.type === EPostSpotType.Recurring && data.daysOfWeek?.length === 0), {
    message: "Days of week are required for recurring posts.",
    path: ["daysOfWeek"],
  }).refine((data) => {
    return data.type !== EPostSpotType.Recurring && data.start !== "";
  }, {
    message: "Date is required.",
    path: ["start"],
  });

export type TCalendarSpot = z.infer<typeof calendarSpotSchema>;

export type TResponseCalendarSpot = TCalendarSpot & {
  id: string;
  days?: number[] | null;
};
