/**
 * Dummy Post Endpoint
 * 
 * Simulates the backend's /api/Posting/Post endpoint
 */

import { createPost } from "@/server/dummy-backend/posts";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mediaUrls, platform, accountId, scheduledDate, recurringId, spotId } = body;

    // Default to demo user
    const userId = "demo-user-1";

    const newPost = createPost({
      content: content || "New post content",
      mediaUrls: mediaUrls || [],
      status: scheduledDate ? "scheduled" : "draft",
      scheduledDate: scheduledDate || null,
      publishedDate: null,
      platform: platform || "twitter",
      accountId: accountId || "acc-1",
      userId,
      recurringId: recurringId || null,
      spotId: spotId || null,
      likes: 0,
      retweets: 0,
      replies: 0
    });

    return NextResponse.json({
      data: newPost,
      succeeded: true,
      errors: [],
      message: "Post created successfully"
    });
  } catch (_error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}