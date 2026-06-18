/**
 * Dummy Team Members Endpoint
 *
 * Simulates the backend's /api/User/team-members endpoint
 */

import { teamMembers } from "@/server/dummy-backend/index";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") ?? "team-demo-1";

    const team = teamMembers;

    return NextResponse.json({
      data: { teamMembers: team },
      succeeded: true,
      errors: [],
      message: "Team members retrieved successfully",
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