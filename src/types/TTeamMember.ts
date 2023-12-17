import { type EUserType } from "./EUserType";

export type TTeamMember = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: EUserType;
  subbordinates: Array<unknown>;
  email: string;
  manager: string | null;
};
