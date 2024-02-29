import { type EProviders } from "./EProviders";

export type TAccount = {
  id: string;
  accountType: EProviders;
  username: string;
  photoUrl: string;
  isExpired?: boolean;
};
