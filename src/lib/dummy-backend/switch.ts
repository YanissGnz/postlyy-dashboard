/**
 * Dummy Backend Switch
 *
 * Central utility to determine whether to use dummy or real backend.
 * Controlled by DUMMY_BACKEND (server) and NEXT_PUBLIC_DUMMY_BACKEND_ENABLED (client) env vars.
 */

import { env } from "@/env";

/**
 * Check if dummy backend is enabled on the server side.
 * Use this in Server Components, API routes, and server utilities.
 */
export function isDummyBackendEnabled(): boolean {
  return env.DUMMY_BACKEND === "true";
}

/**
 * Check if dummy backend is enabled on the client side.
 * Use this in client components, hooks, and client utilities.
 */
export function isDummyBackendEnabledClient(): boolean {
  return env.NEXT_PUBLIC_DUMMY_BACKEND_ENABLED === "true";
}

/**
 * Get the base URL for dummy backend API routes.
 * These are Next.js API routes served locally.
 */
export function getDummyBackendBaseUrl(): string {
  return ""; // API routes are proxied through Next.js
}

/**
 * Determine which backend to use based on context.
 * Server-side: checks DUMMY_BACKEND env var
 * Client-side: checks NEXT_PUBLIC_DUMMY_BACKEND_ENABLED env var
 */
export function shouldUseDummyBackend(): boolean {
  // Server-side check takes priority
  if (typeof window === "undefined") {
    return isDummyBackendEnabled();
  }
  return isDummyBackendEnabledClient();
}

/**
 * Build a dummy backend API route path.
 * @param category - API category (e.g., "Calendar", "Drafts")
 * @param endpoint - Endpoint path (e.g., "events", "all")
 * @returns Full API route path (e.g., "/api/dummy/api/Calendar/events")
 */
export function buildDummyApiPath(category: string, endpoint: string): string {
  return `/api/dummy/api/${category}/${endpoint}`;
}

/**
 * Build a dummy backend auth route path.
 * @param endpoint - Auth endpoint (e.g., "login", "refresh-token")
 * @returns Full auth route path (e.g., "/api/dummy/auth/login")
 */
export function buildDummyAuthPath(endpoint: string): string {
  return `/api/dummy/auth/${endpoint}`;
}