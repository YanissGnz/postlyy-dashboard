/**
 * Dummy Notes Endpoint
 * 
 * Simulates the backend's /api/Notes endpoint
 */

import { notes as mockNotes } from "@/server/dummy-backend/index";
import { NextResponse } from "next/server";

export interface TNote {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    return NextResponse.json({
      data: mockNotes,
      succeeded: true,
      errors: [],
      message: "Notes retrieved successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<TNote>;
    const newNote: TNote = {
      id: `note-${Date.now()}`,
      title: body.title ?? "New Note",
      content: body.content ?? "",
      userId: "demo-user-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      data: newNote,
      succeeded: true,
      errors: [],
      message: "Note created successfully"
    });
  } catch {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}