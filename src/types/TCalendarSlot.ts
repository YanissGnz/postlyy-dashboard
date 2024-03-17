import { z } from "zod";
import { EPostSlotType } from "./EPostSlotType";

export const calendarSlotSchema = z
  .object({
    type: z.nativeEnum(EPostSlotType),
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
        data.type === EPostSlotType.Recurring &&
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
  .refine(
    (data) =>
      !(data.type === EPostSlotType.Recurring && data.daysOfWeek?.length === 0),
    {
      message: "Days of week are required for recurring posts.",
      path: ["daysOfWeek"],
    },
  )
  .refine(
    (data) => {
      return data.type !== EPostSlotType.Recurring || data.start !== "";
    },
    {
      message: "Date is required.",
      path: ["start"],
    },
  )
  .refine(
    (data) => {
      return Boolean(data.forLinkedIn) || Boolean(data.forTwitter);
    },
    {
      message: "At least one social media platform must be selected.",
      path: ["forTwitter", "forLinkedIn"],
    },
  );

export type TCalendarSlot = z.infer<typeof calendarSlotSchema>;

export type TResponseCalendarSlot = TCalendarSlot & {
  id: string;
  days?: number[] | null;
};
