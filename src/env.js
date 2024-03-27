import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    TWITTER_CLIENT_ID: z.string(),
    TWITTER_CLIENT_SECRET: z.string(),
    LINKEDIN_CLIENT_ID: z.string(),
    LINKEDIN_CLIENT_SECRET: z.string(),
    API_BASE_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXT_PUBLIC_AUTH_BASEURL: z.string().url(),
    NEXT_PUBLIC_JWT_AUTH_SECRET_KEY: z.string(),
    NEXT_PUBLIC_AUTH_SECRET_KEY: z.string(),
    NEXT_PUBLIC_PRO_MONTHLY_PRICE: z.number(),
    NEXT_PUBLIC_PRO_YEARLY_PRICE: z.number(),
    NEXT_PUBLIC_EXPERT_MONTHLY_PRICE: z.number(),
    NEXT_PUBLIC_EXPERT_YEARLY_PRICE: z.number(),
    NEXT_PUBLIC_BASIC_MONTHLY_PRICE: z.number(),
    NEXT_PUBLIC_BASIC_YEARLY_PRICE: z.number(),
    NEXT_PUBLIC_GOOGLE_ID: z.string(),
    NEXT_PUBLIC_TENOR_API_KEY: z.string(),
    NEXT_PUBLIC_ENVIRONMENT: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_AUTH_BASEURL: process.env.NEXT_PUBLIC_AUTH_BASEURL,
    NEXT_PUBLIC_JWT_AUTH_SECRET_KEY:
      process.env.NEXT_PUBLIC_JWT_AUTH_SECRET_KEY,
    NEXT_PUBLIC_AUTH_SECRET_KEY: process.env.NEXT_PUBLIC_AUTH_SECRET_KEY,
    NEXT_PUBLIC_PRO_MONTHLY_PRICE: Number(
      process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE,
    ),
    NEXT_PUBLIC_PRO_YEARLY_PRICE: Number(
      process.env.NEXT_PUBLIC_PRO_YEARLY_PRICE,
    ),
    NEXT_PUBLIC_EXPERT_MONTHLY_PRICE: Number(
      process.env.NEXT_PUBLIC_EXPERT_MONTHLY_PRICE,
    ),
    NEXT_PUBLIC_EXPERT_YEARLY_PRICE: Number(
      process.env.NEXT_PUBLIC_EXPERT_YEARLY_PRICE,
    ),
    NEXT_PUBLIC_BASIC_MONTHLY_PRICE: Number(
      process.env.NEXT_PUBLIC_BASIC_MONTHLY_PRICE,
    ),
    NEXT_PUBLIC_BASIC_YEARLY_PRICE: Number(
      process.env.NEXT_PUBLIC_BASIC_YEARLY_PRICE,
    ),
    NEXT_PUBLIC_GOOGLE_ID: process.env.NEXT_PUBLIC_GOOGLE_ID,
    NEXT_PUBLIC_TENOR_API_KEY: process.env.NEXT_PUBLIC_TENOR_API_KEY,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
