export type TTeamMember = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: number;
  subbordinates: Array<unknown>;
  email: string;
  manager: string | null;
};
