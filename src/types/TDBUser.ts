import { type TAccount } from "./TAccount";

export type TDBUser = {
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
  accounts: Array<TAccount>;
};
