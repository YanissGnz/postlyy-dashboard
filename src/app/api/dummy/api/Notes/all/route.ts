/**
 * Dummy Notes List Endpoint
 *
 * Simulates the backend's /api/Notes/all endpoint
 */

import { notes } from "@/server/dummy-backend/index";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const userNotes = notes.filter((n) => n.userId === userId);

    return NextResponse.json({
      data: { notes: userNotes },
      succeeded: true,
      errors: [],
      message: "Notes retrieved successfully",
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