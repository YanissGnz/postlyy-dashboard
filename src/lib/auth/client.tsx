"use client";

import { findUserByToken, getDB } from "@/lib/mock-data/mock-db";
import type { MockUser } from "@/lib/mock-data/seed";
import { type EProviders } from '@/types/EProviders';
import { type ETiers } from "@/types/ETiers";
import { type EUserType } from "@/types/EUserType";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ── Session type: must be 100% compatible with the existing TDBUser + next-auth module augmentation ──
// The existing code destructures: session?.user.profilePicture, session?.user.fullName,
// session?.user.accounts, session?.user.hasChosenSubscription, session?.user.hasPaidSubscription,
// session?.user.accessToken, session?.status, etc.
// We map MockUser → TDBUser shape here so no UI component breaks.

export interface TDBAccount {
  id: string;
  accountType: EProviders;
  username: string;
  photoUrl: string;
  isExpired?: boolean;
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

export interface TSession {
  user: TSessionUser;
  status: "loading" | "authenticated" | "unauthenticated";
}

export interface SignInResponse {
  ok: boolean;
  error: string | null;
  url: string | null;
}

export interface SignInOptions {
  provider?: string;
  email?: string;
  password?: string;
  redirect?: boolean;
  callbackUrl?: string;
}

export interface AuthContextType {
  data: TSessionUser | null;
  status: TSession["status"];
  signIn: (provider: string, options?: SignInOptions) => Promise<SignInResponse | undefined>;
  signOut: () => Promise<void>;
  getProviders: () => Record<string, { name: string; label: string; signInUrl: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Helper: map MockUser → TSessionUser ──
function mockUserToSession(mock: MockUser): TSessionUser {
  const db = getDB();
  return {
    id: mock.id,
    username: mock.email.split("@")[0] ?? "", // fallback — real username comes from accounts
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

// ── Provider Component ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TSessionUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Check localStorage for existing token on mount
    const token = localStorage.getItem("token");
    if (token) {
      const user = findUserByToken(`Bearer ${token}`);
      if (user) {
        setData(mockUserToSession(user));
        setStatus("authenticated");
        return;
      }
    }
    setStatus("unauthenticated");
  }, []);

  const signIn = useCallback(
    async (provider: string, options?: SignInOptions): Promise<SignInResponse | undefined> => {
      setStatus("loading");
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 300));

      if (provider === "credentials" && options?.email && options?.password) {
        // Credentials login: find user by email + password
        const db = getDB();
        const user = db.users.find(
          (u) => u.email === options.email && u.password === options.password,
        );
        if (user) {
          setData(mockUserToSession(user));
          setStatus("authenticated");
          localStorage.setItem("token", user.accessToken);
          if (options?.redirect !== false) {
            window.location.href = options?.callbackUrl ?? "/";
          }
          return { ok: true, error: null, url: options?.callbackUrl ?? "/" };
        } else {
          // Match the error messages the UI expects
          return { ok: false, error: "The User Was Not Found", url: null };
        }
      }

      // Social providers (mock): just use first available user
      const db = getDB();
      const user = db.users[0];
      if (user) {
        setData(mockUserToSession(user));
        setStatus("authenticated");
        localStorage.setItem("token", user.accessToken);
        if (options?.redirect !== false) {
          window.location.href = options?.callbackUrl ?? "/";
        }
        return { ok: true, error: null, url: options?.callbackUrl ?? "/" };
      } else {
        setStatus("unauthenticated");
        return { ok: false, error: "Failed to sign in", url: null };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setData(null);
    setStatus("unauthenticated");
    localStorage.removeItem("token");
  }, []);

  const getProviders = useCallback(
    () => ({
      credentials: {
        name: "credentials",
        label: "Email/Password",
        signInUrl: "/auth/login",
      },
      twitter: {
        name: "twitter",
        label: "Twitter",
        signInUrl: "/auth/login",
      },
      linkedin: {
        name: "linkedin",
        label: "LinkedIn",
        signInUrl: "/auth/login",
      },
    }),
    [],
  );

  const ctxValue: AuthContextType = {
    data,
    status,
    signIn,
    signOut,
    getProviders,
  };

  return <AuthContext.Provider value={ctxValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}