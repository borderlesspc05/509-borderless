import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { listAssignableProfessionalsAction } from "@/app/actions/professional-team-actions";
import { EquipeTerapeuticaPageView } from "@/components/team/equipe-terapeutica-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Equipe terapêutica",
  description:
    "Vínculos entre profissionais e aprendizes na equipe multidisciplinar.",
};

export default async function EquipeTerapeuticaPage() {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const [patientsResult, professionalsResult] = await Promise.all([
    listPatientsAction(),
    listAssignableProfessionalsAction(),
  ]);

  const patients = (
    patientsResult.success ? patientsResult.data?.patients ?? [] : []
  )
    .filter((patient) => patient.status === "active")
    .map((patient) => ({
      id: patient.id,
      fullName: patient.full_name,
    }));

  const professionals = (
    professionalsResult.success
      ? professionalsResult.data?.professionals ?? []
      : []
  ).map((professional) => ({
    id: professional.id,
    fullName: professional.fullName,
    professionalRole: professional.professionalRole,
    profileLabel: professional.profileLabel,
  }));

  const error = !patientsResult.success
    ? patientsResult.error
    : !professionalsResult.success
      ? professionalsResult.error
      : undefined;

  return (
    <EquipeTerapeuticaPageView
      patients={patients}
      professionals={professionals}
      error={error}
    />
  );
}
