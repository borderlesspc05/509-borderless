import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { DiccaoApplicationPageView } from "@/components/assessments/diccao/diccao-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Avaliação da Dicção",
  description:
    "Protocolo adaptado para avaliação da dicção — articulação, fonação, diadocinesia e mobilidade.",
};

export default async function DiccaoApplicationPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <DiccaoApplicationPageView patients={patients} />;
}
