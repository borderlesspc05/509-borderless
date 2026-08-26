import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { MbgrApplicationPageView } from "@/components/assessments/fono/mbgr-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "MBGR — Exame",
  description: "Exame miofuncional orofacial MBGR.",
};

export default async function MbgrPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <MbgrApplicationPageView patients={patients} />;
}
