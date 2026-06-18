/**
 * Dummy Authentication Login Endpoint
 * 
 * Simulates the backend's /api/Authentication/Login endpoint
 * 
 * Demo Credentials:
 * - demo@postlyy.com / demo123
 * - admin@postlyy.com / admin123
 * - basic@postlyy.com / basic123
 */

import { findUserByEmailPassword } from "@/server/dummy-backend/users";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, offset } = body;

    // Find user by email and password
    const user = findUserByEmailPassword(email as string, password as string);

    if (!user) {
      return NextResponse.json(
        { data: null, succeeded: false, errors: ["Invalid email or password"], message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Generate mock tokens
    const accessToken = `mock_access_token_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

    // Build TDBUser-like response
    const response = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      hasChosenSubscription: user.hasChosenSubscription,
      hasPaidSubscription: user.hasPaidSubscription,
      hasToChangePassword: user.hasToChangePassword,
      hasSetupEmail: user.hasSetupEmail,
      hasSetupUsers: user.hasSetupUsers,
      isTrial: user.isTrial,
      tier: user.tier,
      userType: user.userType,
      accounts: user.accounts,
      teamId: user.teamId,
      teamName: user.teamName,
      accessToken,
      refreshToken,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3, // 3 hours
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };

    return NextResponse.json({
      data: response,
      succeeded: true,
      errors: [],
      message: "Login successful"
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}