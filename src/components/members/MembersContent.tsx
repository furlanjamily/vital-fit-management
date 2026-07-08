import {
  getActiveProfessionalsOptionsAction,
  getMembersAction,
} from "@/app/(app)/members/actions";
import { MembersContentClient } from "@/components/members/MembersContentClient";
import type { ManagedMember } from "@/components/members/members.types";

function membersCacheKey(members: ManagedMember[]) {
  return members
    .map((member) => `${member.id}:${member.status}:${member.professionalId ?? "none"}`)
    .join("|");
}

export async function MembersContent() {
  const [membersResult, professionalsResult] = await Promise.all([
    getMembersAction(),
    getActiveProfessionalsOptionsAction(),
  ]);

  const members = membersResult.success ? membersResult.data : [];
  const professionalOptions = professionalsResult.success ? professionalsResult.data : [];

  const loadError = !membersResult.success
    ? membersResult.error
    : !professionalsResult.success
      ? professionalsResult.error
      : null;

  return (
    <MembersContentClient
      key={membersCacheKey(members)}
      initialMembers={members}
      professionalOptions={professionalOptions}
      loadError={loadError}
    />
  );
}
