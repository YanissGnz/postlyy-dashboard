import { type ETicketType } from "./ETicketType";

export type TTicket = {
  id: string;
  context: string;
  title: string;
  type: ETicketType;
};
