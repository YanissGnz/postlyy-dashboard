/**
 * Dummy Note by ID Endpoint
 *
 * Simulates the backend's /api/Notes/{id} endpoint
 */

import { notes } from "@/server/dummy-backend/index";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const note = notes.find((n) => n.id === id);

    if (!note) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Note not found"],
          message: "Note not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { note },
      succeeded: true,
      errors: [],
      message: "Note retrieved successfully",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existingIndex = notes.findIndex((n) => n.id === id);

    if (existingIndex === -1) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Note not found"],
          message: "Note not found",
        },
        { status: 404 },
      );
    }

    const updatedNote = {
      ...notes[existingIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      data: { note: updatedNote },
      succeeded: true,
      errors: [],
      message: "Note updated successfully",
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existingIndex = notes.findIndex((n) => n.id === id);

    if (existingIndex === -1) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Note not found"],
          message: "Note not found",
        },
        { status: 404 },
      );
    }

    notes.splice(existingIndex, 1);

    return NextResponse.json({
      data: { deleted: true, id },
      succeeded: true,
      errors: [],
      message: "Note deleted successfully",
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