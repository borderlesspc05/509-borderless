import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { SkillChecklistPageView } from "@/components/assessments/psychology/skill-checklist-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  ABLLS_DOMAINS,
  ABLLS_INSTRUMENT,
} from "@/lib/psychology/skill-checklists";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "ABLLS-R",
  description:
    "Protocolo clínico ABLLS-R — linguagem e habilidades de aprendizagem (psicologia / ABA).",
};

export default async function AbllsPage() {
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
      title="ABLLS-R — Assessment of Basic Language and Learning Skills"
      description="Protocolo clínico adaptado para registrar linguagem e habilidades de aprendizagem. Não substitui o protocolo editorial oficial."
      instrument={ABLLS_INSTRUMENT}
      domains={ABLLS_DOMAINS}
      patients={patients}
    />
  );
}
