export type TManager = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: number;
  subbordinates: Array<{
    id: string;
    fullName: string;
    photoUrl: string;
    userType: number;
    subbordinates: [];
  }>;
};
