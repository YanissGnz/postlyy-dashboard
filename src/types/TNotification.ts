import { type ENotificationType } from "./ENotificationType";

export type TNotification = {
  id: string;
  type: ENotificationType;
  text: string;
  streak?: string;
  isRead: boolean;
};
