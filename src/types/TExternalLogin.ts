export type TExternalLogin = {
  fullName: string;
  token: string;
  refreshToken: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupEmail: boolean;
  isTrial: boolean;
  tier: number;
  userType: number;
  accounts: Array<{
    id: string;
    accountType: number;
    username: string;
    photoUrl: string;
  }>;
};
