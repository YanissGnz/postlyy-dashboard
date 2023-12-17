import { type EUserType } from "./EUserType";
import { type TAccount } from "./TAccount";

export type TDBUser = {
  fullName: string;
  accessToken: string;
  refreshToken: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupEmail: boolean;
  isTrial: boolean;
  tier: number;
  userType: EUserType;
  accounts: Array<TAccount>;
};
