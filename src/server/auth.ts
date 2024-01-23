/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    screen_name: string;
    data: {
      name: string;
      profile_image_url: string;
      username: string;
      id: string;
    };
  }
}

async function refreshAccessToken(refetchToken: string) {
  try {
    const response = await fetch(
      `${env.API_BASE_URL}/api/Authentication/RefreshToken`,
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
      accessToken: user.accessToken,
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
      //  3 hours
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      // 30 days
      refetchTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
  } catch (error) {
    return {
      error: "RefreshAccessTokenError",
    };
  }
}

async function getUser(refetchToken: string) {
  try {
    const response = await fetch(
      `${env.API_BASE_URL}/api/Authentication/RefreshToken`,
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
    console.log("🚀 ~ file: auth.ts:128 ~ getUser ~ error:", error);
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
            accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
            refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
          };
        } else if (account.provider === "twitter") {
          const body = JSON.stringify({
            provider: 0,
            id: user.id.toString(),
            refreshToken: user.refreshToken,
            accessToken: user.accessToken,
            email: profile?.email,
            userName: profile?.screen_name,
            picture: user.profilePicture ?? "Images/Default.jpeg",
            date: new Date().toISOString(),
          });
          const response = await fetch(
            `${env.API_BASE_URL}/api/Authentication/External`,
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
              console.log("🚀 ~ jwt ~ err:", err);
              throw new Error("Failed to login");
            });

          token.accessToken = response.accessToken;
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
          token.username = profile?.screen_name;
          token.accessTokenExpires = Date.now() + 1000 * 60 * 60 * 3;
          token.refreshTokenExpires = Date.now() + 1000 * 60 * 60 * 24 * 30;
          return token;
        } else if (account.provider === "linkedin") {
          const body = JSON.stringify({
            provider: 1,
            id: user.id,
            refreshToken: user.refreshToken,
            accessToken: user.accessToken,
            email: profile?.email,
            userName: profile?.name,
            picture: user.profilePicture ?? "Images/Default.jpeg",
            date: new Date().toISOString(),
          });

          const response = await fetch(
            `${env.API_BASE_URL}/api/Authentication/External`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body,
            },
          )
            .then((res) => res.json() as Promise<TDBUser>)
            .catch(() => {
              throw new Error("Failed to login");
            });

          token.accessToken = response.accessToken;
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
          token.username = profile?.name;
          token.accessTokenExpires = Date.now() + 1000 * 60 * 60 * 3;
          token.refreshTokenExpires = Date.now() + 1000 * 60 * 60 * 24 * 30;

          return token;
        }

      if (Date.now() > (token.accessTokenExpires as number)) {
        return {
          ...token,
          ...(await refreshAccessToken(token.refreshToken as string)),
        };
      }

      if (
        token.refreshTokenExpires &&
        Date.now() > (token.refreshTokenExpires as number)
      ) {
        return {
          ...token,
          ...(await refreshAccessToken(token.refreshToken as string)),
        };
      }

      const newUser = await getUser(token.refreshToken as string);

      if (newUser.error) {
        throw new Error(newUser.error);
      }

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
  jwt: {
    maxAge: 60 * 60 * 3,
  },

  providers: [
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "1.0",
      authorization: {
        params: {
          scope:
            "tweet.read tweet.write tweet.moderate.write users.read follows.read follows.write offline.access space.read mute.read mute.write like.read like.write block.read block.write",
        },
      },
      async profile(profile, tokens) {
        return {
          id: profile.id,
          refreshToken: tokens.oauth_token_secret,
          accessToken: tokens.oauth_token,
          email: profile?.email,
          userName: profile?.screen_name,
          profilePicture: profile.profile_image_url,
          accounts: [],
          fullName: profile?.name,
          hasChosenSubscription: false,
          hasPaidSubscription: false,
          hasToChangePassword: false,
          hasSetupEmail: false,
          isTrial: false,
          hasSetupUsers: false,
          username: profile?.screen_name,
          userType: 0,
          tier: 0,
          image: profile.profile_image_url,
          name: profile?.name,
        };
      },
    }),
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      client: { token_endpoint_auth_method: "client_secret_post" },
      wellKnown:
        "https://www.linkedin.com/oauth/.well-known/openid-configuration",
      version: "2.0",
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      async profile(profile, tokens) {
        return {
          id: profile.sub,
          refreshToken: tokens.id_token!,
          accessToken: tokens.access_token!,
          email: profile?.email,
          userName: profile?.name,
          profilePicture: profile.picture,
          accounts: [],
          fullName: profile?.name,
          hasChosenSubscription: false,
          hasPaidSubscription: false,
          hasToChangePassword: false,
          hasSetupEmail: false,
          isTrial: false,
          hasSetupUsers: false,
          username: profile?.name,
          userType: 0,
          tier: 0,
          image: profile.picture,
          name: profile?.name,
        };
      },
    }),
    CredentialsProvider({
      name: "Enterprise Login",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const response = await fetch(
          `${env.API_BASE_URL}/api/Authentication/Login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email ?? "",
              password: credentials?.password ?? "",
              date: new Date().toISOString(),
            }),
          },
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
