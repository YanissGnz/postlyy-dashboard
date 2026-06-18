/**
 * Dummy Template by ID Endpoint
 *
 * Simulates the backend's /api/Template/{id} endpoint
 */

import { getTemplateById } from "@/server/dummy-backend/templates";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const template = getTemplateById(id);

    if (!template) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Template not found"],
          message: "Template not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: { template },
      succeeded: true,
      errors: [],
      message: "Template retrieved successfully",
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