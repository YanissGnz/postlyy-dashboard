/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User,
} from "next-auth";
// providers
import CredentialsProvider from "next-auth/providers/credentials";
import LinkedInProvider from "next-auth/providers/linkedin";
import TwitterProvider from "next-auth/providers/twitter";

import { env } from "@/env";
import { getUTCOffset } from "@/lib/utils";
import { type TDBUser } from "@/types/TDBUser";

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
    } & TDBUser;
  }

  interface User extends TDBUser {
    id: string;
    username: string;
    error?: string;
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

async function refreshUser(refreshToken: string) {
  const isDummyBackend = env.NEXT_PUBLIC_DUMMY_BACKEND_ENABLED === "true";

  if (isDummyBackend) {
    // For dummy backend, the refresh token is valid and doesn't need API call
    return {
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
    };
  }

  try {
    const response = await fetch(
      `${env.API_BASE_URL}/api/Authentication/RefreshToken`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
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
      ...user,
      username: user?.accounts ? user?.accounts[0]?.username : "",
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3, //  3 hours
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
  } catch (error) {
    env.NODE_ENV === "development" &&
      console.log("🚀 ~ file: auth.ts:128 ~ refreshUser ~ error:", error);
    return {
      error: "GetUserError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, account, profile, user }) {
      const offset = getUTCOffset();

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
            offset,
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
              env.NODE_ENV === "development" &&
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
          token.hasSetupUsers = response.hasSetupUsers;
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
            offset,
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
            .then((res) => {
              return res.json() as Promise<TDBUser>;
            })
            .catch((err) => {
              env.NODE_ENV === "development" &&
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
          token.hasSetupUsers = response.hasSetupUsers;
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

      if (!token.refreshToken) {
        throw new Error("No refresh token");
      }

      if (
        token.refreshTokenExpires &&
        Date.now() > (token.refreshTokenExpires as number)
      ) {
        throw new Error("Session expired");
      }

      const newUser = await refreshUser(token.refreshToken as string);

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
      // @ts-expect-error - twitter does not support wellKnown
      async profile(profile, tokens) {
        return {
          id: profile.id_str,
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
          scope: "openid profile email w_member_social",
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
      name: "Credentials Login",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const isDummyBackend = env.NEXT_PUBLIC_DUMMY_BACKEND_ENABLED === "true";

        if (isDummyBackend) {
          // Use dummy backend directly via NextAuth
          const { findUserByEmailPassword } = await import(
            "@/server/dummy-backend/users"
          );

          const user = findUserByEmailPassword(
            credentials?.email ?? "",
            credentials?.password ?? ""
          );

          if (!user) {
            return null;
          }

          // Generate mock tokens for dummy backend
          const accessToken = `mock_access_token_${user.id}_${Date.now()}`;
          const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

          return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            profilePicture: user.profilePicture,
            hasChosenSubscription: user.hasChosenSubscription,
            hasPaidSubscription: user.hasPaidSubscription,
            hasToChangePassword: user.hasToChangePassword,
            hasSetupEmail: user.hasSetupEmail,
            hasSetupUsers: user.hasSetupUsers,
            isTrial: user.isTrial,
            tier: user.tier,
            userType: user.userType,
            accounts: user.accounts,
            username: user.accounts?.[0]?.username ?? "",
            accessToken,
            refreshToken,
            accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
            refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
          } as unknown as User | null;
        }

        // Use real backend API
        const offset = getUTCOffset();

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
              offset,
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