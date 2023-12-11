import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters long",
  }),
  phoneNumber: z.string().optional(),
  photoUrl: z.string().optional(),
  email: z
    .string()
    .email({
      message: "Invalid email",
    })
    .optional(),
});

export type TProfile = z.infer<typeof profileSchema>;
