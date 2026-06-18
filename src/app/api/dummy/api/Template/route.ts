/**
 * Dummy Templates Endpoint
 * 
 * Simulates the backend's /api/Template endpoint
 */

import { createTemplate, getTemplatesByUser } from "@/server/dummy-backend/templates";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const templates = getTemplatesByUser(userId);

    return NextResponse.json({
      data: templates,
      succeeded: true,
      errors: [],
      message: "Templates retrieved successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content, mediaUrls, platform } = body;

    const newTemplate = createTemplate({
      name: name ?? "New Template",
      content: content ?? "",
      mediaUrls: mediaUrls ?? [],
      platform: platform ?? "twitter",
      userId: "demo-user-1"
    });

    return NextResponse.json({
      data: newTemplate,
      succeeded: true,
      errors: [],
      message: "Template created successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}