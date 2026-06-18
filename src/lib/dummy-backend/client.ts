/**
 * Dummy Backend API Client
 *
 * Unified client for fetching data from dummy backend API routes.
 * Use this in React components, hooks, and client-side code.
 */


/**
 * Standard dummy backend response format
 */
export interface DummyApiResponse<T = unknown> {
  data: T;
  succeeded: boolean;
  errors: string[];
  message: string;
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  userId?: string;
  headers?: Record<string, string>;
}

/**
 * Default demo user IDs
 */
const DEFAULT_USER_IDS = {
  demo: "demo-user-1",
  admin: "demo-user-2",
  basic: "demo-user-3",
} as const;

/**
 * Build query string with optional userId
 */
function buildQueryString(queryParams: Record<string, string>, userId?: string): string {
  const params = new URLSearchParams(queryParams);
  if (userId) {
    params.set("userId", userId);
  }
  return params.toString();
}

/**
 * Fetch from dummy backend API
 * @param path - API route path (e.g., "/api/Drafts/all")
 * @param options - Request options
 * @returns Promise with dummy backend response data
 */
export async function dummyFetch<T = unknown>(
  path: string,
  options?: ApiRequestOptions,
): Promise<DummyApiResponse<T>> {
  const {
    method = "GET",
    body,
    userId,
    headers: extraHeaders,
  } = options ?? {};

  let url = path;

  // Add userId as query param for GET requests
  if (method === "GET" && userId) {
    const separator = path.includes("?") ? "&" : "?";
    url = `${path}${separator}userId=${userId}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  return response.json() as Promise<DummyApiResponse<T>>;
}

// ============================================================================
// Authentication API Client
// ============================================================================

export interface AuthLoginResponse {
  data: {
    id: string;
    email: string;
    fullName: string;
    profilePicture: string;
    hasChosenSubscription: boolean;
    hasPaidSubscription: boolean;
    hasToChangePassword: boolean;
    hasSetupEmail: boolean;
    hasSetupUsers: boolean;
    isTrial: boolean;
    tier: number;
    userType: number;
    accounts: unknown[];
    teamId: string | null;
    teamName: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
  };
  succeeded: boolean;
  errors: string[];
  message: string;
}

export async function authLogin(email: string, password: string) {
  return dummyFetch<AuthLoginResponse["data"]>("/api/dummy/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function authRefreshToken(refreshToken: string) {
  return dummyFetch<AuthLoginResponse["data"]>("/api/dummy/auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  });
}

export async function authExternal(provider: string) {
  return dummyFetch<AuthLoginResponse["data"]>("/api/dummy/auth/external", {
    method: "POST",
    body: { provider },
  });
}

export async function authSignup(email: string, password: string, fullName: string) {
  return dummyFetch<AuthLoginResponse["data"]>("/api/dummy/api/Authentication/Signup", {
    method: "POST",
    body: { email, password, fullName },
  });
}

export async function authForgotPassword(email: string) {
  return dummyFetch<{ data: { emailSent: boolean; email: string } }>("/api/dummy/api/Authentication/ForgotPassword", {
    method: "POST",
    body: { email },
  });
}

export async function authResetPassword(email: string, resetCode: string, newPassword: string) {
  return dummyFetch<{ data: { passwordReset: boolean; email: string } }>("/api/dummy/api/Authentication/ResetPassword", {
    method: "POST",
    body: { email, resetCode, newPassword },
  });
}

// ============================================================================
// Dashboard API Client
// ============================================================================

export interface DashboardAnalytics {
  totalPosts: number;
  scheduledPosts: number;
  draftedPosts: number;
  publishedThisMonth: number;
  totalEngagement: {
    likes: number;
    retweets: number;
    replies: number;
    comments: number;
  };
  topPosts: Array<{
    id: string;
    content: string;
    engagement: number;
    platform: string;
  }>;
  engagementByPlatform: Record<string, { likes: number; retweets: number; replies: number }>;
  postingSchedule: Record<string, number>;
}

export async function getDashboardOverview(userId?: string) {
  return dummyFetch<DashboardAnalytics>("/api/dummy/api/Dashboard/Overview", {
    method: "GET",
    userId,
  });
}

// ============================================================================
// Drafts API Client
// ============================================================================

export interface Draft {
  id: string;
  content: string;
  mediaUrls: string[];
  platform: string;
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getDrafts(userId?: string) {
  return dummyFetch<{ drafts: Draft[] }>("/api/dummy/api/Drafts/all", {
    method: "GET",
    userId,
  });
}

export async function getDraft(id: string, userId?: string) {
  return dummyFetch<{ draft: Draft }>(`/api/dummy/api/Drafts/${id}`, {
    method: "GET",
    userId,
  });
}

export async function createDraft(draft: Omit<Draft, "id" | "createdAt" | "updatedAt">, userId?: string) {
  return dummyFetch<{ draft: Draft }>("/api/dummy/api/Drafts/all", {
    method: "POST",
    body: draft,
    userId,
  });
}

export async function updateDraft(id: string, updates: Partial<Draft>, userId?: string) {
  return dummyFetch<{ draft: Draft }>(`/api/dummy/api/Drafts/${id}`, {
    method: "PUT",
    body: updates,
    userId,
  });
}

export async function deleteDraft(id: string, userId?: string) {
  return dummyFetch<{ deleted: boolean; id: string }>(`/api/dummy/api/Drafts/${id}`, {
    method: "DELETE",
    userId,
  });
}

// ============================================================================
// Posts API Client
// ============================================================================

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledDate: string | null;
  publishedDate: string | null;
  platform: string;
  accountId: string;
  userId: string;
  recurringId: string | null;
  spotId: string | null;
  likes: number;
  retweets: number;
  replies: number;
  createdAt: string;
}

export async function getPosts(userId?: string, status?: string) {
  const queryParams: Record<string, string> = {};
  if (status) queryParams.status = status;
  
  const queryString = buildQueryString(queryParams, userId);
  return dummyFetch<{ posts: Post[] }>(`/api/dummy/api/Posts/all?${queryString}`);
}

export async function getPost(id: string, userId?: string) {
  return dummyFetch<{ post: Post }>(`/api/dummy/api/Posts/${id}`, {
    method: "GET",
    userId,
  });
}

// ============================================================================
// Calendar API Client
// ============================================================================

export interface CalendarEvent {
  id: string;
  postId: string;
  title: string;
  startTime: string;
  endTime: string;
  platform: string;
  status: string;
}

export interface Spot {
  id: string;
  date: string;
  postId: string | null;
  platform: string;
}

export async function getCalendarEvents(userId?: string, startDate?: string, endDate?: string) {
  const queryParams: Record<string, string> = {};
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;
  
  const queryString = buildQueryString(queryParams, userId);
  return dummyFetch<{ events: CalendarEvent[]; spots: Spot[] }>(`/api/dummy/api/Calendar/events?${queryString}`);
}

// ============================================================================
// Notifications API Client
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(userId?: string, unreadOnly?: boolean) {
  const queryParams: Record<string, string> = {};
  if (unreadOnly) queryParams.unreadOnly = "true";
  
  const queryString = buildQueryString(queryParams, userId);
  return dummyFetch<{ notifications: Notification[] }>(`/api/dummy/api/Notifications/list?${queryString}`);
}

export async function getUnreadNotificationCount(userId?: string) {
  const queryString = buildQueryString({}, userId);
  return dummyFetch<{ unreadCount: number }>(`/api/dummy/api/Notifications/unread-count?${queryString}`);
}

// ============================================================================
// Templates API Client
// ============================================================================

export interface Template {
  id: string;
  name: string;
  content: string;
  platform: string;
  mediaUrls: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTemplates(userId?: string, platform?: string) {
  const queryParams: Record<string, string> = {};
  if (platform) queryParams.platform = platform;
  
  const queryString = buildQueryString(queryParams, userId);
  return dummyFetch<{ templates: Template[] }>(`/api/dummy/api/Template/all?${queryString}`);
}

export async function getTemplate(id: string, userId?: string) {
  return dummyFetch<{ template: Template }>(`/api/dummy/api/Template/${id}`, {
    method: "GET",
    userId,
  });
}

// ============================================================================
// Inspiration API Client
// ============================================================================

export interface InspirationItem {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  platform: string;
}

export async function getInspirationCategories() {
  return dummyFetch<{ categories: string[]; items: InspirationItem[] }>("/api/dummy/api/Inspiration/categories");
}

// ============================================================================
// Notes API Client
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function getNotes(userId?: string) {
  return dummyFetch<{ notes: Note[] }>("/api/dummy/api/Notes/all", {
    method: "GET",
    userId,
  });
}

export async function getNote(id: string, userId?: string) {
  return dummyFetch<{ note: Note }>(`/api/dummy/api/Notes/${id}`, {
    method: "GET",
    userId,
  });
}

export async function updateNote(id: string, updates: Partial<Note>, userId?: string) {
  return dummyFetch<{ note: Note }>(`/api/dummy/api/Notes/${id}`, {
    method: "PUT",
    body: updates,
    userId,
  });
}

export async function deleteNote(id: string, userId?: string) {
  return dummyFetch<{ deleted: boolean; id: string }>(`/api/dummy/api/Notes/${id}`, {
    method: "DELETE",
    userId,
  });
}

// ============================================================================
// User API Client
// ============================================================================

export interface UserAccount {
  id: string;
  username: string;
  platform: string;
  profileImage: string;
  isConnected: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupEmail: boolean;
  hasSetupUsers: boolean;
  isTrial: boolean;
  tier: number;
  userType: number;
  accounts: UserAccount[];
  teamId: string | null;
  teamName: string | null;
}

export async function getUserProfile(userId?: string) {
  return dummyFetch<{ user: UserProfile }>("/api/dummy/api/User/profile", {
    method: "GET",
    userId,
  });
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  return dummyFetch<{ user: UserProfile }>("/api/dummy/api/User/profile", {
    method: "PUT",
    body: updates,
    userId,
  });
}

export async function getUserAccounts(userId?: string) {
  return dummyFetch<{ accounts: UserAccount[] }>("/api/dummy/api/User/accounts", {
    method: "GET",
    userId,
  });
}

export async function getTeamMembers(teamId?: string) {
  const queryParams: Record<string, string> = {};
  if (teamId) {
    queryParams.teamId = teamId;
  }

  const queryString = buildQueryString(queryParams);
  return dummyFetch<{ teamMembers: unknown[] }>(`/api/dummy/api/User/team-members?${queryString}`);
}

export interface SubscriptionPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export async function getUserSubscription(userId?: string) {
  return dummyFetch<{
    currentPlan: number;
    hasPaidSubscription: boolean;
    plans: Record<string, SubscriptionPlan>;
  }>("/api/dummy/api/User/subscription", {
    method: "GET",
    userId,
  });
}

// ============================================================================
// Support API Client
// ============================================================================

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export async function getSupportTickets(userId?: string) {
  return dummyFetch<{ tickets: SupportTicket[] }>("/api/dummy/api/Support/tickets", {
    method: "GET",
    userId,
  });
}

export async function createSupportTicket(
  body: { subject: string; description: string; priority?: "low" | "medium" | "high" },
  userId?: string,
) {
  return dummyFetch<{ ticket: SupportTicket }>("/api/dummy/api/Support/tickets", {
    method: "POST",
    body,
    userId,
  });
}

// ============================================================================
// Posting API Client
// ============================================================================

export async function schedulePost(
  body: {
    content: string;
    mediaUrls?: string[];
    platform: string;
    accountId: string;
    scheduledDate: string;
  },
  userId?: string,
) {
  return dummyFetch<{ post: Post; spot: Spot }>("/api/dummy/api/Posting/schedule", {
    method: "POST",
    body,
    userId,
  });
}

export async function publishPost(postId: string, userId?: string) {
  return dummyFetch<{
    published: boolean;
    postId: string;
    publishedAt: string;
    userId: string;
  }>("/api/dummy/api/Posting/publish", {
    method: "POST",
    body: { postId, userId },
    userId,
  });
}