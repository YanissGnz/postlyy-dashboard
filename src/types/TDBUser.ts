import { type ETiers } from "./ETiers";
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
  hasSetupUsers: boolean;
  hasSetupEmail: boolean;
  isTrial: boolean;
  tier: ETiers;
  userType: EUserType;
  accounts: Array<TAccount>;
};
