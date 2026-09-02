import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { PopApplicationPageView } from "@/components/assessments/fisio/pop-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "POP — Protocolo de Observação Psicomotora",
  description: "Protocolo de Observação Psicomotora.",
};

export default async function PopPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <PopApplicationPageView patients={patients} />;
}
