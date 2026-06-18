/**
 * Dummy Refresh Token Endpoint
 * 
 * Simulates the backend's /api/Authentication/RefreshToken endpoint
 */

import { findUserById } from "@/server/dummy-backend/users";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const refreshToken = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!refreshToken) {
      return NextResponse.json(
        { data: null, succeeded: false, errors: ["Refresh token required"], message: "Token required" },
        { status: 401 }
      );
    }

    // Find the user associated with this refresh token
    const userId = refreshToken.split("_")[2];
    const user = userId ? findUserById(userId) : null;

    if (!user) {
      return NextResponse.json(
        { data: null, succeeded: false, errors: ["Invalid refresh token"], message: "Token invalid" },
        { status: 401 }
      );
    }

    const newAccessToken = `mock_access_token_${user.id}_${Date.now()}`;
    const newRefreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

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
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };

    return NextResponse.json({
      data: response,
      succeeded: true,
      errors: [],
      message: "Token refreshed"
    });
  } catch (_error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}