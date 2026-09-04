import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { SkillChecklistPageView } from "@/components/assessments/psychology/skill-checklist-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  DESFRALDE_DOMAINS,
  DESFRALDE_INSTRUMENT,
} from "@/lib/to/desfralde-sinais";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Protocolo de Desfralde",
  description:
    "Observação clínica do processo de desfralde — Terapia Ocupacional.",
};

export default async function DesfraldePage() {
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
      title="Protocolo de Desfralde"
      description="Registro clínico de consciência, habilidades de banheiro, controle e contexto familiar/sensorial. Complementa a anamnese de TO."
      instrument={DESFRALDE_INSTRUMENT}
      domains={DESFRALDE_DOMAINS}
      patients={patients}
    />
  );
}
