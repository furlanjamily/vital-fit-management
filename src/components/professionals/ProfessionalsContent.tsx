import { getProfessionalsAction } from "@/app/(app)/professionals/actions";
import { ProfessionalsContentClient } from "@/components/professionals/ProfessionalsContentClient";
import type { ManagedProfessional } from "@/components/professionals/professionals.types";

function professionalsCacheKey(professionals: ManagedProfessional[]) {
  return professionals
    .map((professional) => `${professional.id}:${professional.status}:${professional.memberCount}`)
    .join("|");
}

export async function ProfessionalsContent() {
  const result = await getProfessionalsAction();
  const professionals = result.success ? result.data : [];

  return (
    <ProfessionalsContentClient
      key={professionalsCacheKey(professionals)}
      initialProfessionals={professionals}
      loadError={result.success ? null : result.error}
    />
  );
}
