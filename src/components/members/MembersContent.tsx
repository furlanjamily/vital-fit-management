import { getMembersAction } from "@/app/(app)/members/actions";
import { MembersContentClient } from "@/components/members/MembersContentClient";
import type { ManagedMember } from "@/components/members/members.types";

function membersCacheKey(members: ManagedMember[]) {
  return members.map((member) => `${member.id}:${member.status}`).join("|");
}

export async function MembersContent() {
  const result = await getMembersAction();
  const members = result.ok ? result.members : [];

  return (
    <MembersContentClient
      key={membersCacheKey(members)}
      initialMembers={members}
      loadError={result.ok ? null : result.error}
    />
  );
}
