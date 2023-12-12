import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
// providers
import TwitterProvider from "next-auth/providers/twitter";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { type TDBUser } from "@/types/TDBUser";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & TDBUser;
  }

  interface User extends TDBUser {
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

async function refreshAccessToken(refetchToken: string) {
  console.log("Refreshing access token");

  try {
    const response = await fetch(
      `${env.API_BASEURL}/api/Authentication/RefreshToken`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refetchToken}`,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      throw Error("Failed");
    }

    const user = (await response.json()) as TDBUser;

    return {
      accessToken: user.token,
      refreshToken: user.refreshToken,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupEmail: user.hasSetupEmail,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: user.accounts,
      username: user?.accounts[0]?.username ?? "",
      accessTokenExpires: Date.now() + 1000 * 60 * 24 * 30,
    };
  } catch (error) {
    console.log(error);

    return {
      error: "RefreshAccessTokenError",
    };
  }
}

async function getUser(refetchToken: string) {
  try {
    const response = await fetch(
      `${env.API_BASEURL}/api/Authentication/RefreshToken`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refetchToken}`,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      return {
        error: "GetUserError",
      };
    }

    const user = (await response.json()) as TDBUser;

    return {
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupEmail: user.hasSetupEmail,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: user.accounts,
      username: user?.accounts ? user?.accounts[0]?.username : "",
    };
  } catch (error) {
    console.log(error);

    return {
      error: "GetUserError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account)
        if (account.provider === "credentials") {
          return {
            ...user,
            accessTokenExpires: Date.now() + 1000 * 60 * 24 * 30,
          };
        } else {
          const body = JSON.stringify({
            provider: 0,
            id: profile?.data.id,
            refreshToken: account.refresh_token,
            accessToken: account.access_token,
            email: "",
            userName: profile?.data.username,
            picture: profile?.data.profile_image_url,
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
            .then((res) => res.json() as Promise<TDBUser>)
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
          token.username = profile?.data.username;
          token.accessTokenExpires = Date.now() + 1000 * 60 * 24 * 30;
        }

      if (Date.now() > (token.accessTokenExpires as number)) {
        return {
          ...token,
          ...(await refreshAccessToken(token.refreshToken as string)),
        };
      }

      const newUser = await getUser(token.refreshToken as string);
      return {
        ...token,
        ...newUser,
      };
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          ...token,
        },
      };
    },
  },
  providers: [
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Enterprise Login",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const response = await fetch(
          `${env.API_BASEURL}/api/Authentication/Login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
            }),
          },
        );
        console.log("🚀 ~ file: auth.ts:241 ~ authorize ~ response:", response);
        console.log(
          "🚀 ~ file: auth.ts:241 ~ authorize ~ await response.json():",
          await response.json(),
        );

        if (!response.ok) {
          const error = (await response.json()) as string[];
          throw new Error(error[0]);
        }

        const user = (await response.json()) as TDBUser;

        return {
          ...user,
          id: user.accounts[0]?.id ?? "",
          username: user.accounts[0]?.username ?? "",
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
};
export const getServerAuthSession = () => getServerSession(authOptions);
