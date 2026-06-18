/**
 * Dummy Drafts List Endpoint
 *
 * Simulates the backend's /api/Drafts/all endpoint
 */

import { getDraftsByUser } from "@/server/dummy-backend/drafts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const drafts = getDraftsByUser(userId);

    return NextResponse.json({
      data: { drafts },
      succeeded: true,
      errors: [],
      message: "Drafts retrieved successfully",
    });
  } catch {
    return NextResponse.json(
      {
        data: null,
        succeeded: false,
        errors: ["Internal server error"],
        message: "An error occurred",
      },
      { status: 500 },
    );
  }
}