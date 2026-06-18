/**
 * Dummy ResetPassword Endpoint
 *
 * Simulates the backend's /api/Authentication/ResetPassword endpoint
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email as string;
    const resetCode = body?.resetCode as string;
    const newPassword = body?.newPassword as string;

    if (!email || !resetCode || !newPassword) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Email, resetCode, and newPassword are required"],
          message: "Reset password failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: { passwordReset: true, email },
      succeeded: true,
      errors: [],
      message: "Password reset successfully",
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