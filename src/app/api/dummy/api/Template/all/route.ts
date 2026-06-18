/**
 * Dummy Templates List Endpoint
 *
 * Simulates the backend's /api/Template/all endpoint
 */

import { getTemplatesByUser } from "@/server/dummy-backend/templates";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const platform = searchParams.get("platform");

    let userTemplates = getTemplatesByUser(userId);

    if (platform) {
      userTemplates = userTemplates.filter((t) => t.platform === platform);
    }

    return NextResponse.json({
      data: { templates: userTemplates },
      succeeded: true,
      errors: [],
      message: "Templates retrieved successfully",
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