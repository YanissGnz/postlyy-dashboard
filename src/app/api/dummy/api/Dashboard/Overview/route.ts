/**
 * Dummy Dashboard Overview Endpoint
 * 
 * Simulates the backend's /api/Dashboard/Overview endpoint
 */

import { dashboardAnalytics } from "@/server/dummy-backend/index";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    // Return dashboard analytics data
    const response = {
      ...dashboardAnalytics,
      userId
    };

    return NextResponse.json({
      data: response,
      succeeded: true,
      errors: [],
      message: "Dashboard data retrieved successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}