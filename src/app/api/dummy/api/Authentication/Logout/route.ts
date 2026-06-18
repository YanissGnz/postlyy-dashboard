/**
 * Dummy Logout Endpoint
 *
 * Simulates the backend's /api/Authentication/Logout endpoint
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const header = request.headers.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    // In dummy mode, we don't validate the token
    return NextResponse.json({
      data: { loggedOut: true, token: token },
      succeeded: true,
      errors: [],
      message: "Logout successful",
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