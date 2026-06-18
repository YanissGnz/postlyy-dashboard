/**
 * Dummy Draft by ID Endpoint
 *
 * Simulates the backend's /api/Drafts/{id} endpoint
 */

import { deleteDraft, getDraftById, updateDraft } from "@/server/dummy-backend/drafts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const draft = getDraftById(id);

    if (!draft) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Draft not found"],
          message: "Draft not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { draft },
      succeeded: true,
      errors: [],
      message: "Draft retrieved successfully",
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

    const draft = updateDraft(id, body);

    if (!draft) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Draft not found"],
          message: "Draft not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { draft },
      succeeded: true,
      errors: [],
      message: "Draft updated successfully",
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
    const deleted = deleteDraft(id);

    if (!deleted) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Draft not found"],
          message: "Draft not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { deleted: true, id },
      succeeded: true,
      errors: [],
      message: "Draft deleted successfully",
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