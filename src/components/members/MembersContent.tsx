import { getMembersAction } from "@/app/(app)/members/actions";
import { MembersContentClient } from "@/components/members/MembersContentClient";
import type { ManagedMember } from "@/components/members/members.types";

/** Chave que força o remount do client quando a lista muda no servidor. */
function membersCacheKey(members: ManagedMember[]) {
  return members.map((member) => `${member.id}:${member.status}`).join("|");
}

export async function MembersContent() {
  const result = await getMembersAction();
  const members = result.success ? result.data : [];

  return (
    <MembersContentClient
      key={membersCacheKey(members)}
      initialMembers={members}
      loadError={result.success ? null : result.error}
    />
  );
}
