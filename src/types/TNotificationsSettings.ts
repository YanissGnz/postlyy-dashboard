import { z } from "zod";

export const notificationsSettingsSchema = z.object({
  whenPostsFailToPublish: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  dailyReport: z.boolean().optional(),
  whenQueueIsEmpty: z.boolean().optional(),
  renewalNotifications: z.boolean().optional(),
  thanksForSubscription: z.boolean().optional(),
});

export type TNotificationsSettings = z.infer<
  typeof notificationsSettingsSchema
>;
