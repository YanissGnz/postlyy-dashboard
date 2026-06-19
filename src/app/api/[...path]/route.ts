// ═══════════════════════════════════════════════════════════════════════
// POSTLYY MOCK BACKEND - Catch-all API Route Handler
// ───────────────────────────────────────────────────────────────────────
// This single file handles ALL API endpoints that the frontend expects.
// It operates on an in-memory data store seeded with realistic data.
// No database required - perfect for portfolio demos.
// ═══════════════════════════════════════════════════════════════════════

import {
  errorResponse,
  generateId,
  getDB,
  paginatedResponse,
  simulateLatency,
  successResponse
} from "@/lib/mock-data/mock-db";
import { type MockDraft } from "@/lib/mock-data/seed";
import { EUserType } from "@/types/EUserType";
import { type NextRequest, NextResponse } from "next/server";

// ─── TYPES ────────────────────────────────────────────────────────────
type RouteHandler = (
  req: NextRequest,
  params: { path: string[] },
) => Promise<NextResponse>;

// ─── MAIN HANDLER ─────────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  await simulateLatency();
  return handleRoute("GET", req, params);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  await simulateLatency();
  return handleRoute("POST", req, params);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  await simulateLatency();
  return handleRoute("PUT", req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  await simulateLatency();
  return handleRoute("PATCH", req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  await simulateLatency();
  return handleRoute("DELETE", req, params);
}

// ─── ROUTE DISPATCHER ─────────────────────────────────────────────────
async function handleRoute(
  method: string,
  req: NextRequest,
  { path }: { path: string[] },
): Promise<NextResponse> {
  try {
    // [...path] gives us path segments AFTER /api/, so we need to prefix
    const fullPath = "/api/" + path.join("/");
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // Parse body once
    const contentType = req.headers.get("content-type") ?? "";
    let body: unknown = null;
    if (contentType.includes("application/json")) {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    // ── AUTHENTICATION ──────────────────────────────────────────────
    if (fullPath.startsWith("/api/Authentication")) {
      return handleAuthRoutes(method, fullPath, body, req);
    }

    // ── ACCOUNT ─────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Account")) {
      return handleAccountRoutes(method, fullPath, req);
    }

    // ── DRAFTS ──────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Drafts")) {
      return handleDraftRoutes(method, fullPath, body, req, searchParams);
    }

    // ── TEMPLATES ──────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Template")) {
      return handleTemplateRoutes(method, fullPath, body, req, searchParams);
    }

    // ── POSTING ────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Posting")) {
      return handlePostingRoutes(method, fullPath, body, req);
    }

    // ── CALENDAR ────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Calendar")) {
      return handleCalendarRoutes(method, fullPath, body, req, searchParams);
    }

    // ── POST HISTORY ────────────────────────────────────────────────
    if (fullPath.startsWith("/api/PostHistory")) {
      return handlePostHistoryRoutes(method, fullPath, req, searchParams);
    }

    // ── SCHEDULED POSTS ───────────────────────────────────────────
    if (fullPath.startsWith("/api/ScheduledPosts")) {
      return handleScheduledPostRoutes(method, fullPath, body, req);
    }

    // ── INTERNAL NOTES ────────────────────────────────────────────
    if (fullPath.startsWith("/api/InternalNotes")) {
      return handleInternalNoteRoutes(method, fullPath, body, req, searchParams);
    }

    // ── NOTES ──────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Notes")) {
      return handleNoteRoutes(method, fullPath, body, req);
    }

    // ── SUPPORT / TICKETS ──────────────────────────────────────────
    if (fullPath.startsWith("/api/Support")) {
      return handleSupportRoutes(method, fullPath, body, req, searchParams);
    }
    if (fullPath.startsWith("/api/Ticket")) {
      return handleTicketRoutes(method, fullPath, req);
    }

    // ── NOTIFICATIONS ─────────────────────────────────────────────
    if (fullPath.startsWith("/api/Notifications")) {
      return handleNotificationRoutes(method, fullPath, body);
    }

    // ── AINSPIRATION (generative AI) ─────────────────────────────
    if (fullPath.startsWith("/api/AInspiration")) {
      return handleAInspirationRoutes(method, body);
    }

    // ── USER SETTINGS ─────────────────────────────────────────────
    if (fullPath.startsWith("/api/UserSettings")) {
      return handleUserSettingsRoutes(method, fullPath, body, req);
    }

    // ── CUSTOM DASHBOARD ──────────────────────────────────────────
    if (fullPath.startsWith("/api/CustomDashboard")) {
      return handleCustomDashboardRoutes(method, fullPath, searchParams);
    }

    // ── FEEDBACK ──────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Feedback")) {
      return handleFeedbackRoutes(method, body);
    }

    // ── NEWS LETTER ────────────────────────────────────────────────
    if (fullPath.startsWith("/api/NewsLetter")) {
      return NextResponse.json(successResponse(true));
    }

    // ── INSPIRATION ────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Inspiration")) {
      return handleInspirationRoutes(method, body);
    }

    // ── POWERUPS ───────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Powerups")) {
      return handlePowerupsRoutes(method, fullPath, body, req);
    }

    // ── SELF RETWEET ──────────────────────────────────────────────
    if (fullPath.startsWith("/api/SelfRetweet")) {
      return handleSelfRetweetRoutes(method, fullPath, body);
    }

    // ── AUTO RETWEET ─────────────────────────────────────────────
    if (fullPath.startsWith("/api/AutoRetweet")) {
      return handleAutoRetweetRoutes(method, fullPath, body);
    }

    // ── PROFILE ──────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Profile")) {
      return handleProfileRoutes(method, fullPath, body);
    }

    // ── SUBSCRIPTION ─────────────────────────────────────────────
    if (fullPath.startsWith("/api/Subscription")) {
      return handleSubscriptionRoutes(method, fullPath, req);
    }

    // ── TEAM ──────────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Team")) {
      return handleTeamRoutes(method, fullPath, body);
    }

    // ── MANAGER ──────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Manager")) {
      return handleManagerRoutes(method, fullPath);
    }

    // ── NOTIFICATION SETTINGS ────────────────────────────────────
    if (fullPath.startsWith("/api/UserSettings/Notifications")) {
      return handleNotificationSettingsRoutes(method, body);
    }

    // ── DASHBOARD LAYOUT (UserSettings/Dashboard) ────────────────
    if (fullPath.startsWith("/api/UserSettings/Dashboard")) {
      return handleDashboardLayoutRoutes(method, body);
    }

    // ── FINISHER ─────────────────────────────────────────────────
    if (fullPath.startsWith("/api/Finisher")) {
      return handleFinisherRoutes(method, fullPath, body);
    }

    // ── USER MANAGEMENT ─────────────────────────────────────────
    if (fullPath.startsWith("/api/UserManagement")) {
      return handleUserManagementRoutes(method, fullPath);
    }

    // ── CONNECT ─────────────────────────────────────────────────
    if (fullPath.startsWith("/api/connect")) {
      return NextResponse.json(successResponse({ connected: true }));
    }

    // ── FALLBACK ─────────────────────────────────────────────────
    console.log(`[Mock API] Unhandled: ${method} ${fullPath}`);
    return NextResponse.json(errorResponse(`Unhandled endpoint: ${method} ${fullPath}`), { status: 404 });
  } catch (error) {
    console.error("[Mock API Error]", error);
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleAuthRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();
  const user = db.users[0]!;

  if (path === "/api/Authentication/Login" && method === "POST") {
    const { email, password } = body as { email: string; password: string };
    if (email !== user.email || password !== user.password) {
      return NextResponse.json(["Invalid email or password"], { status: 401 });
    }
    return NextResponse.json({
      fullName: user.fullName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupUsers: user.hasSetupUsers,
      hasSetupEmail: user.hasSetupEmail,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: db.accounts.map((a) => ({
        id: a.id,
        accountType: a.accountType,
        username: a.username,
        photoUrl: a.photoUrl,
        isExpired: a.isExpired,
      })),
    });
  }

  if (path === "/api/Authentication/Register" && method === "POST") {
    return NextResponse.json(successResponse(["User registered successfully"]));
  }

  if (path === "/api/Authentication/RefreshToken" && method === "GET") {
    return NextResponse.json({
      fullName: user.fullName,
      accessToken: user.accessToken + "_refreshed",
      refreshToken: user.refreshToken,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupUsers: user.hasSetupUsers,
      hasSetupEmail: user.hasSetupEmail,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: db.accounts.map((a) => ({
        id: a.id,
        accountType: a.accountType,
        username: a.username,
        photoUrl: a.photoUrl,
        isExpired: a.isExpired,
      })),
    });
  }

  if (path === "/api/Authentication/External" && method === "POST") {
    return NextResponse.json({
      fullName: user.fullName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupUsers: user.hasSetupUsers,
      hasSetupEmail: user.hasSetupEmail,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: db.accounts.map((a) => ({
        id: a.id,
        accountType: a.accountType,
        username: a.username,
        photoUrl: a.photoUrl,
        isExpired: a.isExpired,
      })),
    });
  }

  if (path === "/api/Authentication/ForgotPassword" && method === "POST") {
    return NextResponse.json(successResponse(null));
  }

  if (path === "/api/Authentication/ChangeForgottenPassword" && method === "PUT") {
    return NextResponse.json(successResponse(null));
  }

  if (path === "/api/Authentication/ChangePassword" && method === "PUT") {
    return NextResponse.json(successResponse(null));
  }

  if (path === "/api/Authentication/SetupEmail" && method === "POST") {
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// ACCOUNT HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleAccountRoutes(method: string, path: string, req: NextRequest) {
  const db = getDB();

  if (path === "/api/Account" && method === "GET") {
    return NextResponse.json(successResponse(db.accounts));
  }

  // DELETE /api/Account/{id}
  const deleteMatch = path.match(/^\/api\/Account\/(.+)$/);
  if (deleteMatch && method === "DELETE") {
    const id = deleteMatch[1]!;
    db.accounts = db.accounts.filter((a) => a.id !== id);
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// DRAFT HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleDraftRoutes(
  method: string,
  path: string,
  body: unknown,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/Drafts (paginated list)
  if (path === "/api/Drafts" && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const searchTerm = params.SearchTerm?.toLowerCase() ?? "";

    let drafts = db.drafts.filter((d) => d.isDraft === true);
    if (searchTerm) {
      drafts = drafts.filter((d) => d.text.toLowerCase().includes(searchTerm));
    }

    const start = (pageNumber - 1) * pageSize;
    const paged = drafts.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, drafts.length));
  }

  // GET /api/Drafts/{id}
  const getByIdMatch = path.match(/^\/api\/Drafts\/([^/]+)$/);
  if (getByIdMatch && method === "GET") {
    const id = getByIdMatch[1]!;
    const draft = db.drafts.find((d) => d.id === id);
    if (!draft) return NextResponse.json(errorResponse("Draft not found"), { status: 404 });

    return NextResponse.json(
      successResponse({
        onTwitter: draft.onTwitter,
        onLinkedIn: draft.onLinkedIn,
        asEvergreen: draft.asEvergreen,
        scheduleDate: draft.scheduleDate,
        isDraft: draft.isDraft,
        isTemplate: draft.isTemplate,
        addFinisher: draft.addFinisher,
        posts: [
          {
            id: draft.id,
            index: draft.index,
            text: draft.text,
            poll: draft.poll,
            twitterDirectLink: draft.twitterDirectLink,
            gifLink: draft.gifLink,
            imageLinks: draft.imageLinks,
            createdAt: draft.createdAt,
          },
        ],
      }),
    );
  }

  // DELETE /api/Drafts/{id}
  if (getByIdMatch && method === "DELETE") {
    const id = getByIdMatch[1]!;
    db.drafts = db.drafts.filter((d) => d.id !== id);
    return NextResponse.json(successResponse(true));
  }

  // PUT /api/Drafts/{id}
  if (getByIdMatch && method === "PUT") {
    const id = getByIdMatch[1]!;
    const formData = await req.formData().catch(() => null);
    const idx = db.drafts.findIndex((d) => d.id === id);

    if (idx === -1) {
      // Create new
      const newDraft: MockDraft = {
        id,
        index: 0,
        text: (formData?.get("text") as string) ?? "",
        poll: null,
        twitterDirectLink: formData?.get("twitterDirectLink") === "true",
        gifLink: (formData?.get("gifLink") as string) ?? null,
        imageLinks: [],
        createdAt: new Date().toISOString(),
        onTwitter: formData?.get("onTwitter") === "true",
        onLinkedIn: formData?.get("onLinkedIn") === "true",
        asEvergreen: formData?.get("asEvergreen") === "true",
        scheduleDate: (formData?.get("scheduleDate") as string) ?? "",
        isDraft: true,
        isTemplate: formData?.get("isTemplate") === "true",
        addFinisher: formData?.get("addFinisher") === "true",
      };
      db.drafts.push(newDraft);
    } else {
      const existing = db.drafts[idx]!;
      // Update fields from formData or body
      if (formData) {
        db.drafts[idx] = {
          ...existing,
          text: (formData.get("text") as string) ?? existing.text,
          onTwitter: formData.get("onTwitter") === "true" ? true : formData.get("onTwitter") === "false" ? false : existing.onTwitter,
          onLinkedIn: formData.get("onLinkedIn") === "true" ? true : formData.get("onLinkedIn") === "false" ? false : existing.onLinkedIn,
        };
      }
    }

    return NextResponse.json(successResponse(true));
  }

  // POST /api/Drafts/Delete/Image/{id}
  const deleteImageMatch = path.match(/^\/api\/Drafts\/Delete\/Image\/(.+)$/);
  if (deleteImageMatch && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// TEMPLATE HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleTemplateRoutes(
  method: string,
  path: string,
  body: unknown,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/Template (paginated list)
  if (path === "/api/Template" && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const templates = db.templates.filter((t) => t.isTemplate === true);
    const start = (pageNumber - 1) * pageSize;
    const paged = templates.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, templates.length));
  }

  // GET /api/Template/{id}
  const templateIdMatch = path.match(/^\/api\/Template\/([^/]+)$/);
  if (templateIdMatch && method === "GET") {
    const id = templateIdMatch[1]!;
    const tmpl = db.templates.find((t) => t.id === id);
    if (!tmpl) return NextResponse.json(errorResponse("Template not found"), { status: 404 });
    return NextResponse.json(
      successResponse({
        onTwitter: tmpl.onTwitter,
        onLinkedIn: tmpl.onLinkedIn,
        asEvergreen: tmpl.asEvergreen,
        scheduleDate: tmpl.scheduleDate,
        isDraft: tmpl.isDraft,
        isTemplate: tmpl.isTemplate,
        addFinisher: tmpl.addFinisher,
        posts: [
          {
            id: tmpl.id,
            index: tmpl.index,
            text: tmpl.text,
            poll: tmpl.poll,
            twitterDirectLink: tmpl.twitterDirectLink,
            gifLink: tmpl.gifLink,
            imageLinks: tmpl.imageLinks,
            createdAt: tmpl.createdAt,
          },
        ],
      }),
    );
  }

  // DELETE /api/Template/{id}
  if (templateIdMatch && method === "DELETE") {
    const id = templateIdMatch[1]!;
    db.templates = db.templates.filter((t) => t.id !== id);
    return NextResponse.json(successResponse(true));
  }

  // PUT /api/Draft/{id} (note: Draft not Template in URL!)
  const draftPutMatch = path.match(/^\/api\/Draft\/([^/]+)$/);
  if (draftPutMatch && method === "PUT") {
    const id = draftPutMatch[1]!;
    const formData = await req.formData().catch(() => null);
    const idx = db.templates.findIndex((t) => t.id === id);
    if (idx >= 0 && formData) {
      db.templates[idx] = {
        ...db.templates[idx]!,
        text: (formData.get("text") as string) ?? db.templates[idx]!.text,
      };
    }
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// POSTING HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handlePostingRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();

  // POST /api/Posting/Post
  if (path === "/api/Posting/Post" && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  // POST /api/Posting/Post/NextEmptySpot
  if (path === "/api/Posting/Post/NextEmptySpot" && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  // POST /api/Posting/Post/NewInSpot/{spotId}
  const spotMatch = path.match(/^\/api\/Posting\/Post\/NewInSpot\/(.+)$/);
  if (spotMatch && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  // POST /api/Posting/Post/NewInRecurring/{recurringId}
  const recurringMatch = path.match(/^\/api\/Posting\/Post\/NewInRecurring\/(.+)$/);
  if (recurringMatch && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// CALENDAR HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleCalendarRoutes(
  method: string,
  path: string,
  body: unknown,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/Calendar
  if (path === "/api/Calendar" && method === "GET") {
    return NextResponse.json(successResponse(db.calendarEvents));
  }

  // GET /api/Calendar/next5
  if (path === "/api/Calendar/next5" && method === "GET") {
    const spots = db.calendarSpots.slice(0, 5);
    return NextResponse.json(successResponse(spots));
  }

  // GET /api/Calendar/recurring
  if (path === "/api/Calendar/recurring" && method === "GET") {
    return NextResponse.json(successResponse(db.calendarSpots.filter((s) => s.type === 3)));
  }

  // POST /api/Calendar/recurring
  if (path === "/api/Calendar/recurring" && method === "POST") {
    const data = body as Record<string, unknown>;
    const newRecurring = {
      id: generateId(),
      type: 3,
      title: (data.title as string) ?? "New Recurring Post",
      daysOfWeek: (data.daysOfWeek as number[]) ?? [1],
      forTwitter: (data.forTwitter as boolean) ?? true,
      forLinkedIn: (data.forLinkedIn as boolean) ?? false,
      startTime: (data.startTime as string) ?? new Date().toISOString(),
    };
    db.recurringPosts.push(newRecurring);
    // Also add as calendar spot
    db.calendarSpots.push({
      id: newRecurring.id,
      title: newRecurring.title,
      type: 3,
      start: new Date().toISOString(),
      startTime: newRecurring.startTime,
      forTwitter: newRecurring.forTwitter,
      forLinkedIn: newRecurring.forLinkedIn,
      postId: null,
      daysOfWeek: newRecurring.daysOfWeek,
    });
    return NextResponse.json(successResponse(newRecurring));
  }

  // PUT /api/Calendar/recurring/{id}
  const recurringIdMatch = path.match(/^\/api\/Calendar\/recurring\/([^/]+)$/);
  if (recurringIdMatch && method === "PUT") {
    const id = recurringIdMatch[1]!;
    const data = body as Record<string, unknown>;
    const idx = db.recurringPosts.findIndex((r) => r.id === id);
    if (idx >= 0) {
      db.recurringPosts[idx] = { ...db.recurringPosts[idx]!, ...data } as typeof db.recurringPosts[0];
    }
    return NextResponse.json(successResponse(db.recurringPosts.find((r) => r.id === id)!));
  }

  // DELETE /api/Calendar/recurring/{id}
  if (recurringIdMatch && method === "DELETE") {
    const id = recurringIdMatch[1]!;
    db.recurringPosts = db.recurringPosts.filter((r) => r.id !== id);
    db.calendarSpots = db.calendarSpots.filter((s) => s.id !== id);
    return NextResponse.json(successResponse(true));
  }

  // POST /api/Calendar/spot
  if (path === "/api/Calendar/spot" && method === "POST") {
    const data = body as Record<string, unknown>;
    const newSpot = {
      id: generateId(),
      title: (data.title as string) ?? "New Spot",
      type: (data.type as number) ?? 0,
      start: (data.start as string) ?? new Date().toISOString(),
      startTime: (data.startTime as string) ?? new Date().toISOString(),
      forTwitter: (data.forTwitter as boolean) ?? true,
      forLinkedIn: (data.forLinkedIn as boolean) ?? true,
      postId: (data.postId as string) ?? null,
      daysOfWeek: (data.daysOfWeek as number[]) ?? null,
    };
    db.calendarSpots.push(newSpot);
    return NextResponse.json(successResponse(newSpot));
  }

  // PUT /api/Calendar/spot/{id}
  const spotIdMatch = path.match(/^\/api\/Calendar\/spot\/([^/]+)$/);
  if (spotIdMatch && method === "PUT") {
    const id = spotIdMatch[1]!;
    const data = body as Record<string, unknown>;
    const idx = db.calendarSpots.findIndex((s) => s.id === id);
    if (idx >= 0) {
      db.calendarSpots[idx] = { ...db.calendarSpots[idx]!, ...data } as typeof db.calendarSpots[0];
    }
    return NextResponse.json(successResponse(db.calendarSpots.find((s) => s.id === id)!));
  }

  // DELETE /api/Calendar/spot/{id}
  if (spotIdMatch && method === "DELETE") {
    const id = spotIdMatch[1]!;
    db.calendarSpots = db.calendarSpots.filter((s) => s.id !== id);
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// POST HISTORY HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handlePostHistoryRoutes(
  method: string,
  path: string,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/PostHistory/{accountId}
  const accountHistoryMatch = path.match(/^\/api\/PostHistory\/([^/]+)$/);
  if (accountHistoryMatch && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const start = (pageNumber - 1) * pageSize;
    const paged = db.postHistory.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, db.postHistory.length));
  }

  // GET /api/PostHistory/BestPosts
  if (path === "/api/PostHistory/BestPosts" && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const sorted = [...db.postHistory].sort((a, b) => b.impressions - a.impressions);
    const start = (pageNumber - 1) * pageSize;
    const paged = sorted.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, sorted.length));
  }

  // GET /api/PostHistory/ImportPost/{id}
  const importMatch = path.match(/^\/api\/PostHistory\/ImportPost\/(.+)$/);
  if (importMatch && method === "GET") {
    const id = importMatch[1]!;
    const entry = db.postHistory.find((p) => p.id === id);
    if (!entry) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(
      successResponse({
        onTwitter: entry.onTwitter,
        onLinkedIn: entry.onLinkedIn,
        asEvergreen: false,
        scheduleDate: "",
        isDraft: false,
        isTemplate: false,
        addFinisher: false,
        posts: [
          {
            id: entry.id,
            index: entry.index,
            text: entry.text,
            poll: entry.pollOptions.length > 0 ? { durationMins: entry.durationMinutes, options: entry.pollOptions } : null,
            twitterDirectLink: entry.twitterDirectLink,
            gifLink: entry.gifLink || null,
            imageLinks: entry.images,
            createdAt: entry.createdAt,
          },
        ],
      }),
    );
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// SCHEDULED POST HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleScheduledPostRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();

  // GET /api/ScheduledPosts/{id}
  const scheduledIdMatch = path.match(/^\/api\/ScheduledPosts\/([^/]+)$/);
  if (scheduledIdMatch && method === "GET") {
    const id = scheduledIdMatch[1]!;
    const sp = db.scheduledPosts.find((s) => s.id === id);
    if (!sp) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(successResponse(sp));
  }

  // PUT /api/ScheduledPosts/{id}
  if (scheduledIdMatch && method === "PUT") {
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// NOTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleNoteRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();

  // GET /api/Notes
  if (path === "/api/Notes" && method === "GET") {
    return NextResponse.json(successResponse(db.notes));
  }

  // GET /api/Notes/{id}
  const noteIdMatch = path.match(/^\/api\/Notes\/([^/]+)$/);
  if (noteIdMatch && method === "GET") {
    const id = noteIdMatch[1]!;
    const note = db.notes.find((n) => n.id === id);
    if (!note) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(successResponse(note));
  }

  // POST /api/Notes
  if (path === "/api/Notes" && method === "POST") {
    const data = body as { name: string; content: string };
    const newNote = {
      id: generateId(),
      name: data.name ?? "New Note",
      content: data.content ?? "",
    };
    db.notes.push(newNote);
    return NextResponse.json(successResponse(newNote));
  }

  // PUT /api/Notes/{id}
  if (noteIdMatch && method === "PUT") {
    const id = noteIdMatch[1]!;
    const data = body as { name: string; content: string };
    const idx = db.notes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      db.notes[idx] = { ...db.notes[idx]!, name: data.name ?? db.notes[idx]!.name, content: data.content ?? db.notes[idx]!.content };
    }
    return NextResponse.json(successResponse(db.notes.find((n) => n.id === id)!));
  }

  // DELETE /api/Notes/{id}
  if (noteIdMatch && method === "DELETE") {
    const id = noteIdMatch[1]!;
    db.notes = db.notes.filter((n) => n.id !== id);
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// TICKET HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleTicketRoutes(method: string, path: string, req: NextRequest) {
  const db = getDB();

  // GET /api/Ticket (list)
  if (path === "/api/Ticket" && method === "GET") {
    return NextResponse.json(successResponse(db.tickets));
  }

  // GET /api/Ticket/{id} (details)
  const ticketIdMatch = path.match(/^\/api\/Ticket\/([^/]+)$/);
  if (ticketIdMatch && method === "GET") {
    const id = ticketIdMatch[1]!;
    const details = db.ticketDetails.find((t) => t.id === id);
    if (!details) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(successResponse(details));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleNotificationRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  // GET /api/Notifications/all
  if ((path === "/api/Notifications" || path === "/api/Notifications/all") && method === "GET") {
    return NextResponse.json(successResponse(db.notifications));
  }

  // POST /api/Notifications/dismiss
  if (path === "/api/Notifications/dismiss" && method === "POST") {
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// USER SETTINGS HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleUserSettingsRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();

  // GET /api/UserSettings/Notifications
  if (path === "/api/UserSettings/Notifications" && method === "GET") {
    return NextResponse.json(successResponse(db.notificationsSettings));
  }

  // PUT /api/UserSettings/Notifications
  if (path === "/api/UserSettings/Notifications" && method === "PUT") {
    const data = body as Record<string, boolean>;
    db.notificationsSettings = { ...db.notificationsSettings, ...data };
    return NextResponse.json(successResponse(db.notificationsSettings));
  }

  // GET /api/UserSettings/Dashboard
  if (path === "/api/UserSettings/Dashboard" && method === "GET") {
    const config = JSON.parse(db.dashboardConfig) as Record<string, unknown>[];
    return NextResponse.json(successResponse(config));
  }

  // PUT /api/UserSettings/Dashboard
  if (path === "/api/UserSettings/Dashboard" && method === "PUT") {
    const data = body as { dashboard: string };
    if (data?.dashboard) {
      db.dashboardConfig = data.dashboard;
    }
    return NextResponse.json(successResponse(null));
  }

  // POST /api/UserSettings/GenerateCalendar
  if (path === "/api/UserSettings/GenerateCalendar" && method === "POST") {
    return NextResponse.json(successResponse(null));
  }

  // POST /api/UserSettings/Tour/Done/{id}
  const tourMatch = path.match(/^\/api\/UserSettings\/Tour\/Done\/(.+)$/);
  if (tourMatch && method === "POST") {
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// CUSTOM DASHBOARD HANDLERS
// ═══════════════════════════════════════════════════════════════════════
//
// Generates statistically-plausible, contextual mock data based on:
// - provider: Twitter vs LinkedIn have different engagement patterns
// - statType: Impressions, Likes, Replies, Retweets, etc.
// - aggregation: Sum vs Average vs Total
// - date range: time-series data shows organic growth/decline trends

const TWITTER_FOLLOWER_BASE = 12500;
const LINKEDIN_FOLLOWER_BASE = 8700;

/**
 * Generate a realistic daily value for a given stat type and provider.
 * Uses Gaussian-like distribution seeded by the day index for organic trends.
 */
function realisticStatValue(
  statType: number,
  provider: number,
  dayIndex: number, // 0 = oldest, larger = more recent (growth trend)
  totalDays: number,
): number {
  // Growth factor: recent days get a slight boost (up to +30% from first to last)
  const growthFactor = 1 + (dayIndex / Math.max(totalDays, 1)) * 0.3;
  // Base randomness with Gaussian-like distribution (sum of 3 randoms)
  const noise = (Math.random() + Math.random() + Math.random()) / 3;
  // Weekly pattern: weekends slightly lower engagement
  const dayOfWeek = new Date().getDay();
  const weekendDip = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;

  const isTwitter = provider === 0;

  const statConfigs: Record<number, { twitter: number[]; linkedin: number[] }> = {
    0: { twitter: [800, 3000], linkedin: [400, 1500] },       // Impressions
    1: { twitter: [50, 400], linkedin: [20, 150] },            // Likes
    2: { twitter: [10, 80], linkedin: [5, 40] },               // Replies
    3: { twitter: [15, 120], linkedin: [3, 25] },              // Retweets
    4: { twitter: [20, 150], linkedin: [10, 60] },             // LinkClicks
    5: { twitter: [5, 40], linkedin: [8, 50] },                // ProfileClicks
    6: { twitter: [12100, 12900], linkedin: [8400, 9000] },    // Followers (slow growth)
    7: { twitter: [1, 5], linkedin: [0, 3] },                  // Posts
    8: { twitter: [15, 40], linkedin: [5, 20] },               // Scheduled
  };

  const config = statConfigs[statType] ?? statConfigs[0]!;
  const range = isTwitter ? config.twitter : config.linkedin;
  const minVal = range[0] ?? 0;
  const maxVal = range[1] ?? minVal + 100;
  const base = minVal + (maxVal - minVal) * noise;
  return Math.round(base * growthFactor * weekendDip);
}

/**
 * Build a cumulative series for graph display.
 * Creates an upward-trending curve with realistic weekly cycles.
 */
function buildGraphSeries(
  statType: number,
  provider: number,
  days: number,
  seriesName: string,
): { name: string; data: number[] } {
  const data: number[] = [];
  for (let i = 0; i < days; i++) {
    const value = realisticStatValue(statType, provider, i, days);
    // For cumulative stats like Followers, values should be monotonic
    if (statType === 6) {
      const prev = data[i - 1] ?? (provider === 0 ? TWITTER_FOLLOWER_BASE : LINKEDIN_FOLLOWER_BASE);
      data.push(Math.max(prev, prev + Math.floor(Math.random() * 20) - 5));
    } else {
      data.push(value);
    }
  }
  return { name: seriesName, data };
}

async function handleCustomDashboardRoutes(
  method: string,
  path: string,
  params: Record<string, string>,
) {
  // GET /api/CustomDashboard/Stat
  if (path === "/api/CustomDashboard/Stat" && method === "GET") {
    const statType = parseInt(params.statType ?? "0");
    const provider = parseInt(params.provider ?? "0");
    const aggregation = parseInt(params.aggregation ?? "0");
    const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 86400000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));

    let totalValue = 0;
    for (let i = 0; i < days; i++) {
      totalValue += realisticStatValue(statType, provider, i, days);
    }

    // Apply aggregation logic
    let value: number;
    if (aggregation === 1) {
      // Average
      value = Math.round(totalValue / days);
    } else {
      // Sum or Total
      value = totalValue;
    }

    return NextResponse.json(
      successResponse([{ userId: "user_1", value }]),
    );
  }

  // GET /api/CustomDashboard/GraphStats
  if (path === "/api/CustomDashboard/GraphStats" && method === "GET") {
    const statType = parseInt(params.statType ?? "0");
    const provider = parseInt(params.provider ?? "0");
    const days = 30;

    const labels: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    // Build 1-3 series depending on context
    const series = [
      buildGraphSeries(statType, provider, days, "Impressions"),
    ];

    // For "total" aggregations, add comparison series
    if (provider === 0 || provider === 1) {
      const otherProvider = provider === 0 ? 1 : 0;
      series.push(buildGraphSeries(statType, otherProvider, days, provider === 0 ? "LinkedIn" : "Twitter"));
    }

    return NextResponse.json(
      successResponse({
        category: labels,
        series,
      }),
    );
  }

  // GET /api/CustomDashboard/TodayCalendarEvents
  if (path === "/api/CustomDashboard/TodayCalendarEvents" && method === "GET") {
    const db = getDB();
    return NextResponse.json(successResponse(db.calendarEvents));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// INTERNAL NOTES HANDLERS (/api/InternalNotes)
// ═══════════════════════════════════════════════════════════════════════
async function handleInternalNoteRoutes(
  method: string,
  path: string,
  body: unknown,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/InternalNotes (paginated)
  if (path === "/api/InternalNotes" && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const start = (pageNumber - 1) * pageSize;
    const paged = db.notes.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, db.notes.length));
  }

  // GET /api/InternalNotes/{id}
  const noteIdMatch = path.match(/^\/api\/InternalNotes\/([^/]+)$/);
  if (noteIdMatch && method === "GET") {
    const id = noteIdMatch[1]!;
    const note = db.notes.find((n) => n.id === id);
    if (!note) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(successResponse(note));
  }

  // POST /api/InternalNotes
  if (path === "/api/InternalNotes" && method === "POST") {
    const formData = body as { name?: string; content?: string } ?? {};
    const newNote = {
      id: generateId(),
      name: formData.name ?? "New Note",
      content: formData.content ?? "",
    };
    db.notes.push(newNote);
    return NextResponse.json(successResponse(newNote));
  }

  // PUT /api/InternalNotes/{id}
  if (noteIdMatch && method === "PUT") {
    const id = noteIdMatch[1]!;
    const formData = body as { name?: string; content?: string } ?? {};
    const idx = db.notes.findIndex((n) => n.id === id);
    if (idx >= 0) {
      db.notes[idx] = {
        ...db.notes[idx]!,
        name: formData.name ?? db.notes[idx]!.name,
        content: formData.content ?? db.notes[idx]!.content,
      };
    }
    return NextResponse.json(successResponse(true));
  }

  // DELETE /api/InternalNotes/{id}
  if (noteIdMatch && method === "DELETE") {
    const id = noteIdMatch[1]!;
    db.notes = db.notes.filter((n) => n.id !== id);
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// SUPPORT HANDLERS (/api/Support)
// ═══════════════════════════════════════════════════════════════════════
async function handleSupportRoutes(
  method: string,
  path: string,
  body: unknown,
  req: NextRequest,
  params: Record<string, string>,
) {
  const db = getDB();

  // GET /api/Support (paginated tickets)
  if (path === "/api/Support" && method === "GET") {
    const pageNumber = parseInt(params.PageNumber ?? "1");
    const pageSize = parseInt(params.PageSize ?? "10");
    const start = (pageNumber - 1) * pageSize;
    const paged = db.tickets.slice(start, start + pageSize);
    return NextResponse.json(paginatedResponse(paged, pageNumber, pageSize, db.tickets.length));
  }

  // GET /api/Support/{id} (ticket details)
  const ticketIdMatch = path.match(/^\/api\/Support\/([^/]+)$/);
  if (ticketIdMatch && method === "GET") {
    const id = ticketIdMatch[1]!;
    const details = db.ticketDetails.find((t) => t.id === id);
    if (!details) return NextResponse.json(errorResponse("Not found"), { status: 404 });
    return NextResponse.json(successResponse(details));
  }

  // POST /api/Support (create ticket)
  if (path === "/api/Support" && method === "POST") {
    const data = body as { title?: string; context?: string } ?? {};
    const id = generateId();
    const newTicket = {
      id,
      title: data.title ?? "New Support Ticket",
      type: 0,
      status: 0,
      priority: 1,
      createdAt: new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
    };
    db.tickets.push(newTicket);
    db.ticketDetails.push({
      id,
      context: data.context ?? "",
      responses: [],
      title: data.title ?? "New Support Ticket",
      type: 0,
      status: 0,
      priority: 1,
      createdAt: new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
    });
    return NextResponse.json(successResponse(newTicket));
  }

  // POST /api/Support/{id}/response (add response to ticket)
  const responseMatch = path.match(/^\/api\/Support\/([^/]+)\/response$/);
  if (responseMatch && method === "POST") {
    const id = responseMatch[1]!;
    const data = body as { response?: string } ?? {};
    const details = db.ticketDetails.find((t) => t.id === id);
    if (details) {
      details.responses.push({
        id: generateId(),
        response: data.response ?? "Thank you for your message. We'll look into this.",
        writtenAt: new Date().toISOString(),
        writtenBy: "Support Team",
      });
    }
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// AINSPIRATION HANDLERS (/api/AInspiration)
// ═══════════════════════════════════════════════════════════════════════
async function handleAInspirationRoutes(method: string, body: unknown) {
  if (method === "POST") {
    const data = body as Record<string, unknown>;
    const context = (data.context as string) ?? "";
    const audience = (data.audience as string) ?? "general";

    // Generate 3 unique mock post variations
    const posts = [
      `🔥 **Post Idea 1: Hook + Value**
"${context ? context + ' - ' : ''}The secret to building an engaged audience? Stop selling and start solving. 

Share one actionable tip your audience can use TODAY. What's your go-to advice for ${audience === 'general' ? 'growing on social media' : audience}?

#ValueFirst #ContentStrategy #Growth"`,
      `💡 **Post Idea 2: Storytelling**
"${context ? context + ' - ' : ''}I remember when I first started out. I thought I needed to have everything perfect before I could share.

Biggest lesson learned: Progress over perfection. Your audience wants to see the real journey, not just the highlight reel.

What's something you've learned the hard way? 👇

#RealTalk #Journey #LessonsLearned"`,
      `📊 **Post Idea 3: Data + Insight**
"${context ? context + ' - ' : ''}Did you know? Posts with a clear CTA get 2x more engagement.

Here are 3 CTAs that actually work:
1️⃣ "Tag someone who needs to see this"
2️⃣ "Save this for later"
3️⃣ "Drop your thoughts below"

Which one will you try? 🚀

#SocialMediaTips #Engagement #GrowthHacks"`,
    ];

    return NextResponse.json(successResponse({ content: posts }));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// FEEDBACK HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleFeedbackRoutes(method: string, body: unknown) {
  const db = getDB();
  if (method === "POST") {
    const data = body as { stars: number; comment: string };
    db.feedback.push({
      id: generateId(),
      stars: data.stars ?? 5,
      comment: data.comment ?? "",
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(successResponse(null));
  }
  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// INSPIRATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleInspirationRoutes(method: string, body: unknown) {
  const db = getDB();
  if (method === "POST") {
    const data = body as { context: string; audience: string; postType: number; type: number; tone: number; formality: number };
    const request = JSON.stringify(data);
    const response = `Here's an engaging post based on your request:

${data.context ? `"${data.context}" - ` : ""}Did you know that the most successful social media strategies focus on providing genuine value to their audience? 

Here are 3 tips to level up your content game:

1️⃣ Know your audience inside out
2️⃣ Consistency beats perfection every time
3️⃣ Always include a clear call-to-action

Which tip will you implement today? 🚀

#SocialMediaTips #ContentStrategy #Growth`;

    db.inspirationHistory.push({
      id: generateId(),
      request,
      response,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(successResponse({ response }));
  }

  if (method === "GET") {
    return NextResponse.json(successResponse(db.inspirationHistory));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// POWERUPS HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handlePowerupsRoutes(method: string, path: string, body: unknown, req: NextRequest) {
  const db = getDB();

  // GET /api/Powerups
  if (path === "/api/Powerups" && method === "GET") {
    return NextResponse.json(successResponse(db.powerups));
  }

  // PUT /api/Powerups
  if (path === "/api/Powerups" && method === "PUT") {
    const data = body as Record<string, unknown>;
    if (data.autoPlug) {
      db.powerups.autoPlug = data.autoPlug as typeof db.powerups.autoPlug;
    }
    if (data.selfRetweet) {
      db.powerups.selfRetweet = data.selfRetweet as typeof db.powerups.selfRetweet;
    }
    db.powerups.emptySpotsActAsEvergreen = (data.emptySpotsActAsEvergreen as boolean) ?? db.powerups.emptySpotsActAsEvergreen;
    db.powerups.splitLongTextToThreads = (data.splitLongTextToThreads as boolean) ?? db.powerups.splitLongTextToThreads;
    db.powerups.expandThreadsAfterThreeLines = (data.expandThreadsAfterThreeLines as boolean) ?? db.powerups.expandThreadsAfterThreeLines;
    return NextResponse.json(successResponse(db.powerups));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// SELF RETWEET HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleSelfRetweetRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  if (path === "/api/SelfRetweet" && method === "GET") {
    return NextResponse.json(successResponse(db.powerups.selfRetweet));
  }

  if (path === "/api/SelfRetweet" && method === "PUT") {
    const data = body as Record<string, unknown>;
    db.powerups.selfRetweet = { ...db.powerups.selfRetweet, ...data } as typeof db.powerups.selfRetweet;
    return NextResponse.json(successResponse(db.powerups.selfRetweet));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// AUTO RETWEET HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleAutoRetweetRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  if (path === "/api/AutoRetweet" && method === "GET") {
    return NextResponse.json(successResponse(db.autoRetweetLinks));
  }

  if (path === "/api/AutoRetweet" && method === "POST") {
    return NextResponse.json(successResponse(true));
  }

  const deleteMatch = path.match(/^\/api\/AutoRetweet\/(.+)$/);
  if (deleteMatch && method === "DELETE") {
    return NextResponse.json(successResponse(true));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// PROFILE HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleProfileRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  if (path === "/api/Profile" && method === "GET") {
    return NextResponse.json(successResponse(db.profile));
  }

  if (path === "/api/Profile" && method === "PUT") {
    const data = body as { fullName?: string; email?: string };
    if (data.fullName) db.profile.fullName = data.fullName;
    if (data.email) db.profile.email = data.email;
    return NextResponse.json(successResponse(db.profile));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleSubscriptionRoutes(method: string, path: string, req: NextRequest) {
  const db = getDB();

  if (path === "/api/Subscription" && method === "GET") {
    return NextResponse.json(successResponse(db.subscription));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// TEAM HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleTeamRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  if (path === "/api/Team" && method === "GET") {
    return NextResponse.json(successResponse(db.team));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// MANAGER HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleManagerRoutes(method: string, path: string) {
  const db = getDB();

  if (path === "/api/Manager" && method === "GET") {
    return NextResponse.json(successResponse(db.managers));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// USER MANAGEMENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleUserManagementRoutes(method: string, path: string, body?: unknown, req?: NextRequest) {
  const db = getDB();

  // GET /api/UserManagement/All (returns TTeamMember[])
  if (path === "/api/UserManagement/All" && method === "GET") {
    return NextResponse.json(successResponse(db.team));
  }

  // GET /api/UserManagement/Managers (returns TManager[])
  if (path === "/api/UserManagement/Managers" && method === "GET") {
    return NextResponse.json(successResponse(db.managers));
  }

  // POST /api/UserManagement/Managers (add manager)
  if (path === "/api/UserManagement/Managers" && method === "POST") {
    return NextResponse.json(successResponse(db.managers[0]!));
  }

  // DELETE /api/UserManagement/Managers/{id}
  const managerDeleteMatch = path.match(/^\/api\/UserManagement\/Managers\/(.+)$/);
  if (managerDeleteMatch && method === "DELETE") {
    return NextResponse.json(successResponse(null));
  }

  // POST /api/UserManagement/Subordinates (add team member)
  if (path === "/api/UserManagement/Subordinates" && method === "POST") {
    const data = (body ?? {}) as { email: string };
    const newMember = {
      id: generateId(),
      fullName: "New Member",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=New",
      userType: EUserType.TeamMember,
      email: data.email ?? "new@example.com",
    };
    db.team.push(newMember);
    return NextResponse.json(successResponse(newMember));
  }

  // PUT /api/UserManagement/Subordinates (update team member)
  if (path === "/api/UserManagement/Subordinates" && method === "PUT") {
    return NextResponse.json(successResponse(db.team[0]!));
  }

  // POST /api/UserManagement/Subordinates/{managerId} (add to manager)
  const subAddMatch = path.match(/^\/api\/UserManagement\/Subordinates\/(.+)$/);
  if (subAddMatch && method === "POST") {
    const data = (body ?? {}) as { email: string };
    const newMember = {
      id: generateId(),
      fullName: "New Subordinate",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sub",
      userType: EUserType.TeamMember,
      email: data.email ?? "new@example.com",
    };
    db.team.push(newMember);
    return NextResponse.json(successResponse(newMember));
  }

  // DELETE /api/UserManagement/Subordinates/{subordinateId}
  if (subAddMatch && method === "DELETE") {
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleNotificationSettingsRoutes(method: string, body: unknown) {
  // Already handled in handleUserSettingsRoutes, this is a fallback
  const db = getDB();

  if (method === "GET") {
    return NextResponse.json(successResponse(db.notificationsSettings));
  }

  if (method === "PUT") {
    const data = body as Record<string, boolean>;
    db.notificationsSettings = { ...db.notificationsSettings, ...data };
    return NextResponse.json(successResponse(db.notificationsSettings));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD LAYOUT HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleDashboardLayoutRoutes(method: string, body: unknown) {
  const db = getDB();

  if (method === "GET") {
    // Return as string since frontend's transformResponse does JSON.parse(response.data)
    return NextResponse.json(successResponse(db.dashboardConfig));
  }

  if (method === "PUT") {
    const data = body as { dashboard: string };
    if (data?.dashboard) {
      db.dashboardConfig = data.dashboard;
    }
    return NextResponse.json(successResponse(null));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}

// ═══════════════════════════════════════════════════════════════════════
// FINISHER HANDLERS
// ═══════════════════════════════════════════════════════════════════════
async function handleFinisherRoutes(method: string, path: string, body: unknown) {
  const db = getDB();

  if (path === "/api/Finisher" && method === "GET") {
    return NextResponse.json(successResponse(db.finisher));
  }

  if (path === "/api/Finisher" && method === "PUT") {
    const data = body as { finisherText?: string };
    if (data.finisherText) {
      db.finisher.finisherText = data.finisherText;
    }
    return NextResponse.json(successResponse(db.finisher));
  }

  return NextResponse.json(errorResponse("Not found"), { status: 404 });
}