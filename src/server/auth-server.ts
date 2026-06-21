"use server";

import { getDB } from "@/lib/mock-data/mock-db";
import type { MockUser } from "@/lib/mock-data/seed";
import { type ETiers } from "@/types/ETiers";
import { type EUserType } from "@/types/EUserType";

export interface MockProvider {
  name: string;
  label: string;
  signInUrl: string;
  id: string;
  type: "oauth" | "credentials";
}

// Server-side session check
export async function getServerAuthSession(): Promise<{
  user: TSessionUser;
  status: "authenticated" | "unauthenticated";
} | null> {
  // In a real app, this would read cookies from the request
  // For mock auth, we return null (no server-side session)
  // The client-side AuthProvider handles session via localStorage
  return null;
}

// Server-side providers list (for login page)
export async function getProviders() {
  return {
    credentials: {
      name: "Credentials Login",
      label: "Email/Password",
      signInUrl: "/auth/login",
      id: "credentials",
      type: "credentials",
    },
    twitter: {
      name: "Twitter",
      label: "Twitter",
      signInUrl: "/auth/login",
      id: "twitter",
      type: "oauth" as const,
    },
    linkedin: {
      name: "LinkedIn",
      label: "LinkedIn",
      signInUrl: "/auth/login",
      id: "linkedin",
      type: "oauth" as const,
    },
  } as Record<string, MockProvider>;
}

export interface TSessionUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupUsers: boolean;
  hasSetupEmail: boolean;
  isTrial: boolean;
  tier: ETiers;
  userType: EUserType;
  accounts: TDBAccount[];
}

export interface TDBAccount {
  id: string;
  accountType: number;
  username: string;
  photoUrl: string;
  isExpired?: boolean;
}

function mockUserToSession(mock: MockUser): TSessionUser {
  const db = getDB();
  return {
    id: mock.id,
    username: mock.email.split("@")[0] ?? "",
    fullName: mock.fullName,
    email: mock.email,
    accessToken: mock.accessToken,
    refreshToken: mock.refreshToken,
    profilePicture: mock.profilePicture,
    hasChosenSubscription: mock.hasChosenSubscription,
    hasPaidSubscription: mock.hasPaidSubscription,
    hasToChangePassword: mock.hasToChangePassword,
    hasSetupUsers: mock.hasSetupUsers,
    hasSetupEmail: mock.hasSetupEmail,
    isTrial: mock.isTrial,
    tier: mock.tier,
    userType: mock.userType,
    accounts: mock.accounts.map((accId: string) => {
      const account = db.accounts.find((a) => a.id === accId);
      return account
        ? {
            id: account.id,
            accountType: account.accountType,
            username: account.username,
            photoUrl: account.photoUrl,
            isExpired: account.isExpired,
          }
        : {
            id: accId,
            accountType: 0,
            username: "",
            photoUrl: "",
            isExpired: true,
          };
    }),
  };
}