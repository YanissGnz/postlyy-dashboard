/**
 * Dummy Drafts Endpoint
 * 
 * Simulates the backend's /api/Drafts endpoint
 */

import { createDraft, getDraftsByUser } from "@/server/dummy-backend/drafts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user-1";

    const drafts = getDraftsByUser(userId);

    return NextResponse.json({
      data: drafts,
      succeeded: true,
      errors: [],
      message: "Drafts retrieved successfully"
    });
  } catch (_error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mediaUrls, platform, accountId } = body as Record<string, any>;

    const newDraft = createDraft({
      content: content || "",
      mediaUrls: mediaUrls || [],
      platform: platform || "twitter",
      accountId: accountId || "acc-1",
      userId: "demo-user-1"
    });

    return NextResponse.json({
      data: newDraft,
      succeeded: true,
      errors: [],
      message: "Draft created successfully"
    });
  } catch (_error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}