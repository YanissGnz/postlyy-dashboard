/**
 * Dummy ForgotPassword Endpoint
 *
 * Simulates the backend's /api/Authentication/ForgotPassword endpoint
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email as string;

    if (!email) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Email is required"],
          message: "Forgot password failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: { emailSent: true, email },
      succeeded: true,
      errors: [],
      message: "Password reset email sent successfully",
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