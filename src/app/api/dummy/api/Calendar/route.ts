/**
 * Dummy Calendar Endpoint
 * 
 * Simulates the backend's /api/Calendar endpoint
 */

import { calendarEvents, spots } from "@/server/dummy-backend/index";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "events";

    let data: unknown;
    
    if (type === "spots") {
      data = spots;
    } else {
      data = calendarEvents;
    }

    return NextResponse.json({
      data,
      succeeded: true,
      errors: [],
      message: `${type} retrieved successfully`
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}