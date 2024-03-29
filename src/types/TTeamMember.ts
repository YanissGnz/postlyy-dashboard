import { type EUserType } from "./EUserType";

export type TTeamMember = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: EUserType;
  subbordinates: Array<{
    id: string;
    fullName: string;
  }>;
  email: string;
  manager: string | null;
};
