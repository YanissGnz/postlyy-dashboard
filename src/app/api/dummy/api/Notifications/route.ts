/**
 * Dummy Notifications Endpoint
 * 
 * Simulates the backend's /api/Notifications endpoint
 */

import { getNotificationsByUser, markAsRead } from "@/server/dummy-backend/notifications";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = getNotificationsByUser(userId, unreadOnly);

    return NextResponse.json({
      data: notifications,
      succeeded: true,
      errors: [],
      message: "Notifications retrieved successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      markAsRead(notificationId);
    }

    return NextResponse.json({
      data: null,
      succeeded: true,
      errors: [],
      message: notificationId ? "Notification marked as read" : "All notifications marked as read"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}