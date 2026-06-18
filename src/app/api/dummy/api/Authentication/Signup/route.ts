/**
 * Dummy Signup Endpoint
 *
 * Simulates the backend's /api/Authentication/Signup endpoint
 */

import { users as mockUsers } from "@/server/dummy-backend/users";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        {
          data: null,
          succeeded: false,
          errors: ["User with this email already exists"],
          message: "Signup failed",
        },
        { status: 409 },
      );
    }

    // Create mock user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      fullName,
      profilePicture: "https://api.postlyy.com/Images/Default.jpeg",
      hasChosenSubscription: false,
      hasPaidSubscription: false,
      hasToChangePassword: true,
      hasSetupEmail: true,
      hasSetupUsers: false,
      isTrial: true,
      tier: 0,
      userType: 0,
      accounts: [],
      teamId: null,
      teamName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate mock tokens
    const accessToken = `mock_access_token_${newUser.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${newUser.id}_${Date.now()}`;

    const response = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      profilePicture: newUser.profilePicture,
      hasChosenSubscription: newUser.hasChosenSubscription,
      hasPaidSubscription: newUser.hasPaidSubscription,
      hasToChangePassword: newUser.hasToChangePassword,
      hasSetupEmail: newUser.hasSetupEmail,
      hasSetupUsers: newUser.hasSetupUsers,
      isTrial: newUser.isTrial,
      tier: newUser.tier,
      userType: newUser.userType,
      accounts: newUser.accounts,
      teamId: newUser.teamId,
      teamName: newUser.teamName,
      accessToken,
      refreshToken,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };

    return NextResponse.json({
      data: response,
      succeeded: true,
      errors: [],
      message: "Signup successful",
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