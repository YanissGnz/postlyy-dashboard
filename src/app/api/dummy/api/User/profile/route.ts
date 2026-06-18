/**
 * Dummy User Profile Endpoint
 *
 * Simulates the backend's /api/User/profile endpoint
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

    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      data: { user: userWithoutPassword },
      succeeded: true,
      errors: [],
      message: "User profile retrieved successfully",
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const body = await request.json();

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

    const updatedUser = {
      ...user,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const { password: _password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      data: { user: userWithoutPassword },
      succeeded: true,
      errors: [],
      message: "User profile updated successfully",
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