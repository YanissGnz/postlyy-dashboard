/**
 * Dummy Schedule Post Endpoint
 *
 * Simulates the backend's /api/Posting/schedule endpoint
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mediaUrls, platform, accountId, scheduledDate, userId } =
      body;

    const finalUserId = userId ?? "demo-user-1";

    const newPost = {
      id: `post-${Date.now()}`,
      content,
      mediaUrls: mediaUrls ?? [],
      status: "scheduled" as const,
      scheduledDate,
      publishedDate: null,
      platform,
      accountId,
      userId: finalUserId,
      recurringId: null,
      spotId: `spot-${Date.now()}`,
      likes: 0,
      retweets: 0,
      replies: 0,
      createdAt: new Date().toISOString(),
    };

    const newSpot = {
      id: `spot-${Date.now()}`,
      date: scheduledDate,
      postId: newPost.id,
      platform,
    };

    return NextResponse.json({
      data: { post: newPost, spot: newSpot },
      succeeded: true,
      errors: [],
      message: "Post scheduled successfully",
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