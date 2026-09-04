import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { SkillChecklistPageView } from "@/components/assessments/psychology/skill-checklist-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { AFLS_DOMAINS, AFLS_INSTRUMENT } from "@/lib/psychology/skill-checklists";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "AFLS",
  description:
    "Protocolo clínico AFLS — habilidades funcionais de vida (psicologia / ABA).",
};

export default async function AflsPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return (
    <SkillChecklistPageView
      title="AFLS — Assessment of Functional Living Skills"
      description="Protocolo clínico adaptado para registrar domínio funcional. Não substitui o protocolo editorial oficial."
      instrument={AFLS_INSTRUMENT}
      domains={AFLS_DOMAINS}
      patients={patients}
    />
  );
}
