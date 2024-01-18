import { z } from "zod";

export const finisherSchema = z.object({
  finisherText: z.string(),
  finisherImage: z.any(),
});

export type TFinisher = z.infer<typeof finisherSchema>;
