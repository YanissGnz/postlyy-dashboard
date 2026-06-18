/**
 * Dummy Inspiration Endpoint
 * 
 * Simulates the backend's /api/Inspiration endpoint
 */

import { inspirationContent } from "@/server/dummy-backend/index";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      data: inspirationContent,
      succeeded: true,
      errors: [],
      message: "Inspiration content retrieved successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}