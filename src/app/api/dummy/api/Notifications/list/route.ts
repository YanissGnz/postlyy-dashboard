/**
 * Dummy Notifications List Endpoint
 *
 * Simulates the backend's /api/Notifications/list endpoint
 */

import { notifications } from "@/server/dummy-backend/index";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let userNotifications = notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.isRead);
    }

    return NextResponse.json({
      data: { notifications: userNotifications },
      succeeded: true,
      errors: [],
      message: "Notifications retrieved successfully",
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