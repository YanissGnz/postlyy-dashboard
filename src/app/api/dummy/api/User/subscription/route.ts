/**
 * Dummy User Subscription Endpoint
 *
 * Simulates the backend's /api/User/subscription endpoint
 */

import { subscriptionPlans } from "@/server/dummy-backend/index";
import { findUserById } from "@/server/dummy-backend/users";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";

    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["User not found"],
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        currentPlan: user.tier,
        hasPaidSubscription: user.hasPaidSubscription,
        plans: subscriptionPlans,
      },
      succeeded: true,
      errors: [],
      message: "Subscription info retrieved successfully",
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "demo-user-1";
    const body = await request.json();
    const { plan, billingCycle } = body;

    const user = findUserById(userId);

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["User not found"],
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const selectedPlan = subscriptionPlans[plan as keyof typeof subscriptionPlans];

    if (!selectedPlan) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["Invalid plan selected"],
          message: "Invalid plan",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: {
        updated: true,
        currentPlan: plan,
        billingCycle: billingCycle ?? "monthly",
        price:
          billingCycle === "yearly"
            ? selectedPlan.yearlyPrice
            : selectedPlan.monthlyPrice,
      },
      succeeded: true,
      errors: [],
      message: "Subscription updated successfully",
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