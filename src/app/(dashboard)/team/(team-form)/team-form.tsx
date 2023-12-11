import React from "react";
import { TeamMembersDataTable } from "./team-member-data-table";
import { teamMembersColumns } from "./team-members-columns";

export default function TeamForm() {
  return (
    <div>
      <TeamMembersDataTable columns={teamMembersColumns} data={[]} />
    </div>
  );
}
