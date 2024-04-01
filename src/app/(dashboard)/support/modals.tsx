"use client";

import AddResponse from "./add-response";
import AddTicketDialog from "./add-ticket-dialog";
import TicketDetails from "./ticket-details";

export default function Modals() {
  return (
    <>
      <AddTicketDialog />
      <TicketDetails />
      <AddResponse />
    </>
  );
}
