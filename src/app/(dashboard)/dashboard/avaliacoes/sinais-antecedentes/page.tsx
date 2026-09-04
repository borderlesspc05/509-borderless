import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { SkillChecklistPageView } from "@/components/assessments/psychology/skill-checklist-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  SINAIS_ANTECEDENTES_DOMAINS,
  SINAIS_ANTECEDENTES_INSTRUMENT,
} from "@/lib/to/desfralde-sinais";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Sinais Antecedentes e Gatilhos",
  description:
    "Observação de sinais antecedentes e gatilhos comportamentais — Terapia Ocupacional.",
};

export default async function SinaisAntecedentesPage() {
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
      title="Sinais Antecedentes e Gatilhos"
      description="Mapeamento de gatilhos ambientais, sinais sensoriais/emocionais precoces e função provável do comportamento para planejamento preventivo."
      instrument={SINAIS_ANTECEDENTES_INSTRUMENT}
      domains={SINAIS_ANTECEDENTES_DOMAINS}
      patients={patients}
    />
  );
}
