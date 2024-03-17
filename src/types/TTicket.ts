import { type ETicketPriority } from "./ETicketPriority";
import { type ETicketStatus } from "./ETicketStatus";
import { type ETicketType } from "./ETicketType";

export type TTicket = {
  id: string;
  title: string;
  type: ETicketType;
  status: ETicketStatus;
  priority: ETicketPriority;
  createdAt: string;
  lastUpdateAt: string;
};
