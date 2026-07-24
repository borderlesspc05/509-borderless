import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { EquipeTerapeuticaPageView } from "@/components/team/equipe-terapeutica-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Equipe terapêutica",
  description:
    "Profissionais que acompanham cada aprendiz na equipe multidisciplinar.",
};

export default async function EquipeTerapeuticaPage() {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const patientsResult = await listPatientsAction();

  const patients = (patientsResult.data?.patients ?? [])
    .filter((patient) => patient.status === "active")
    .map((patient) => ({
      id: patient.id,
      fullName: patient.full_name,
    }));

  return (
    <EquipeTerapeuticaPageView
      patients={patients}
      error={patientsResult.success ? undefined : patientsResult.error}
    />
  );
}
