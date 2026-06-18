/**
 * Dummy External Authentication Endpoint
 * 
 * Simulates the backend's /api/Authentication/External endpoint
 * Used for Twitter and LinkedIn OAuth flows
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, id, refreshToken, accessToken, email, userName, picture, offset } = body;

    // For demo purposes, always return the primary demo user
    const user = {
      id: "demo-user-1",
      email: "demo@postlyy.com",
      fullName: "Demo User",
      profilePicture: "https://api.postlyy.com/Images/Default.jpeg",
      hasChosenSubscription: true,
      hasPaidSubscription: true,
      hasToChangePassword: false,
      hasSetupEmail: true,
      hasSetupUsers: true,
      isTrial: false,
      tier: 2,
      userType: 1,
      accounts: [
        {
          id: "acc-1",
          username: (userName as string) || "demo_user",
          platform: (provider as number) === 0 ? "twitter" : "linkedin",
          profileImage: "https://api.postlyy.com/Images/Default.jpeg",
          isConnected: true
        }
      ],
      teamId: "team-demo-1",
      teamName: "Demo Team"
    };

    // Generate mock tokens
    const accessTokenMock = `mock_access_token_${user.id}_${Date.now()}`;
    const refreshTokenMock = `mock_refresh_token_${user.id}_${Date.now()}`;

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
      accessToken: accessTokenMock,
      refreshToken: refreshTokenMock,
      accessTokenExpires: Date.now() + 1000 * 60 * 60 * 3,
      refreshTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };

    return NextResponse.json({
      data: response,
      succeeded: true,
      errors: [],
      message: "External login successful"
    });
  } catch (_error) {
    return NextResponse.json(
      { data: null, succeeded: false, errors: ["Internal server error"], message: "An error occurred" },
      { status: 500 }
    );
  }
}