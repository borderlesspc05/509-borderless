import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { LinguagemProcApplicationPageView } from "@/components/assessments/fono/linguagem-proc-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Linguagem Infantil",
  description: "Avaliação de linguagem infantil (PROC / TIPITI).",
};

export default async function LinguagemProcPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <LinguagemProcApplicationPageView patients={patients} />;
}
