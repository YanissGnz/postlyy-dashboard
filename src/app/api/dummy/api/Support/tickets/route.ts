/**
 * Dummy Support Tickets Endpoint
 *
 * Simulates the backend's /api/Support/tickets endpoint
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface TMockSupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

const mockTickets: TMockSupportTicket[] = [
  {
    id: "ticket-1",
    userId: "demo-user-1",
    subject: "Cannot schedule posts",
    description: "I'm unable to schedule posts for future dates. Getting an error every time.",
    status: "open",
    priority: "high",
    createdAt: "2026-06-15T10:00:00Z",
    updatedAt: "2026-06-16T14:00:00Z",
  },
  {
    id: "ticket-2",
    userId: "demo-user-2",
    subject: "Billing inquiry",
    description: "I was charged twice for my subscription this month.",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-17T11:00:00Z",
  },
  {
    id: "ticket-3",
    userId: "demo-user-1",
    subject: "Feature request: bulk upload",
    description: "Would love to have the ability to upload posts in bulk via CSV.",
    status: "resolved",
    priority: "low",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-05T16:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const userTickets = mockTickets.filter((t) => t.userId === userId);

    return NextResponse.json({
      data: { tickets: userTickets },
      succeeded: true,
      errors: [],
      message: "Support tickets retrieved successfully",
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, description, priority, userId } = body;

    const finalUserId = userId ?? "demo-user-1";
    const now = new Date().toISOString();

    const newTicket: TMockSupportTicket = {
      id: `ticket-${Date.now()}`,
      userId: finalUserId,
      subject: subject ?? "Support Request",
      description: description ?? "",
      status: "open",
      priority: priority ?? "medium",
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      data: { ticket: newTicket },
      succeeded: true,
      errors: [],
      message: "Support ticket created successfully",
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