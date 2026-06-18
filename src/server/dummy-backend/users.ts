/**
 * Mock users data for the dummy backend
 */

export interface TMockUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupEmail: boolean;
  hasSetupUsers: boolean;
  isTrial: boolean;
  tier: number;
  userType: number;
  accounts: Array<{
    id: string;
    username: string;
    platform: string;
    profileImage: string;
    isConnected: boolean;
  }>;
  teamId: string | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
}

export const users: TMockUser[] = [
  {
    id: "demo-user-1",
    email: "demo@postlyy.com",
    password: "demo123",
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
        username: "demo_user",
        platform: "twitter",
        profileImage: "https://api.postlyy.com/Images/Default.jpeg",
        isConnected: true
      }
    ],
    teamId: "team-demo-1",
    teamName: "Demo Team",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2026-06-18T10:00:00Z"
  },
  {
    id: "demo-user-2",
    email: "admin@postlyy.com",
    password: "admin123",
    fullName: "Admin User",
    profilePicture: "https://api.postlyy.com/Images/Default.jpeg",
    hasChosenSubscription: true,
    hasPaidSubscription: true,
    hasToChangePassword: false,
    hasSetupEmail: true,
    hasSetupUsers: true,
    isTrial: false,
    tier: 3,
    userType: 1,
    accounts: [
      {
        id: "acc-2",
        username: "admin_user",
        platform: "twitter",
        profileImage: "https://api.postlyy.com/Images/Default.jpeg",
        isConnected: true
      },
      {
        id: "acc-3",
        username: "admin_user_linkedin",
        platform: "linkedin",
        profileImage: "https://api.postlyy.com/Images/Default.jpeg",
        isConnected: true
      }
    ],
    teamId: "team-demo-2",
    teamName: "Admin Team",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2026-06-18T10:00:00Z"
  },
  {
    id: "demo-user-3",
    email: "basic@postlyy.com",
    password: "basic123",
    fullName: "Basic User",
    profilePicture: "https://api.postlyy.com/Images/Default.jpeg",
    hasChosenSubscription: true,
    hasPaidSubscription: false,
    hasToChangePassword: false,
    hasSetupEmail: true,
    hasSetupUsers: false,
    isTrial: true,
    tier: 1,
    userType: 0,
    accounts: [
      {
        id: "acc-4",
        username: "basic_user",
        platform: "twitter",
        profileImage: "https://api.postlyy.com/Images/Default.jpeg",
        isConnected: false
      }
    ],
    teamId: null,
    teamName: null,
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-18T10:00:00Z"
  }
];

/**
 * Find a user by email and password
 */
export function findUserByEmailPassword(email: string, password: string): TMockUser | undefined {
  return users.find(u => u.email === email && u.password === password);
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): TMockUser | undefined {
  return users.find(u => u.id === id);
}