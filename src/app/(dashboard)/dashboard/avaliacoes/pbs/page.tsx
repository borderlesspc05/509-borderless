import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { PbsApplicationPageView } from "@/components/assessments/fisio/pbs-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Pediatric Balance Scale (PBS)",
  description: "Escala pediátrica de equilíbrio.",
};

export default async function PbsPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <PbsApplicationPageView patients={patients} />;
}
