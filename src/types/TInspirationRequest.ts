import {
  type EInspirationFormality,
  type EInspirationPostType,
  type EInspirationTone,
  type EInspirationType,
} from "./EInspiration";

export type TInspirationRequest = {
  postType: EInspirationPostType;
  type: EInspirationType;
  tone: EInspirationTone;
  formality: EInspirationFormality;
  audience: string;
  context: string;
};
