/**
 * Dummy Publish Post Endpoint
 *
 * Simulates the backend's /api/Posting/publish endpoint
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    const finalUserId = userId ?? "demo-user-1";

    return NextResponse.json({
      data: {
        published: true,
        postId,
        publishedAt: new Date().toISOString(),
        userId: finalUserId,
      },
      succeeded: true,
      errors: [],
      message: "Post published successfully",
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