/**
 * Dummy Calendar Events Endpoint
 *
 * Simulates the backend's /api/Calendar/events endpoint
 */

import { calendarEvents, spots } from "@/server/dummy-backend/index";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let filteredEvents = calendarEvents.filter((e) => e.postId !== null);

    if (startDate) {
      filteredEvents = filteredEvents.filter(
        (e) => new Date(e.startTime) >= new Date(startDate),
      );
    }
    if (endDate) {
      filteredEvents = filteredEvents.filter(
        (e) => new Date(e.startTime) <= new Date(endDate),
      );
    }

    return NextResponse.json({
      data: { events: filteredEvents, spots },
      succeeded: true,
      errors: [],
      message: "Calendar events retrieved successfully",
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