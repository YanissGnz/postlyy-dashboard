/**
 * Dummy Inspiration Categories Endpoint
 *
 * Simulates the backend's /api/Inspiration/categories endpoint
 */

import { inspirationContent } from "@/server/dummy-backend/index";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = Array.from(
      new Set(inspirationContent.map((item) => item.category)),
    );

    return NextResponse.json({
      data: { categories, items: inspirationContent },
      succeeded: true,
      errors: [],
      message: "Inspiration categories retrieved successfully",
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