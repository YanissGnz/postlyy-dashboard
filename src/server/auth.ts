import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
// providers
import TwitterProvider from "next-auth/providers/twitter";

import { env } from "@/env";
import { type TApiUser } from "@/types/TApiUser";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"] &
      TApiUser;
  }

  interface User {
    id: string;
    username: string;
  }

  interface Account {
    provider: string;
    providerAccountId: string;
    token_type: string;
    expires_at: number;
    access_token: string;
    scope: string;
    refresh_token: string;
  }
  interface Profile {
    data: {
      name: string;
      profile_image_url: string;
      username: string;
      id: string;
    };
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const body = JSON.stringify({
          provider: 0,
          id: profile.data.id,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          email: "",
          userName: profile.data.username,
          picture: profile.data.profile_image_url,
        });
        const response = await fetch(
          `${env.API_BASEURL}/api/Authentication/External`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body,
          },
        )
          .then((res) => res.json() as Promise<TApiUser>)
          .catch((err) => {
            console.log("🚀 ~ file: auth.ts:80 ~ jwt ~ err", err);
            throw new Error("Failed to login");
          });

        token.accessToken = response.token;
        token.refreshToken = response.refreshToken;
        token.fullName = response.fullName;
        token.profilePicture = response.profilePicture;
        token.hasChosenSubscription = response.hasChosenSubscription;
        token.hasPaidSubscription = response.hasPaidSubscription;
        token.hasToChangePassword = response.hasToChangePassword;
        token.hasSetupEmail = response.hasSetupEmail;
        token.isTrial = response.isTrial;
        token.tier = response.tier;
        token.userType = response.userType;
        token.accounts = response.accounts;
        token.username = profile.data.username;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        ...token,
      },
    }),
  },
  providers: [
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
  ],
  // pages: {
  //   signIn: "/login",
  // },
};
export const getServerAuthSession = () => getServerSession(authOptions);
