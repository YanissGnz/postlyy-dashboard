/**
 * Dummy User Accounts Endpoint
 *
 * Simulates the backend's /api/User/accounts endpoint
 */

import { findUserById } from "@/server/dummy-backend/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["User not found"],
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { accounts: user.accounts },
      succeeded: true,
      errors: [],
      message: "Accounts retrieved successfully",
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