import { type TApiAccount } from "./TApiAccount";

export type TApiUser = {
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
  accounts: Array<TApiAccount>;
};
