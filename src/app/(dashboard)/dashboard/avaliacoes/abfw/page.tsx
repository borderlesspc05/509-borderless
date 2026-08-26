import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { AbfwApplicationPageView } from "@/components/assessments/fono/abfw-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "ABFW — Fonologia",
  description: "Prova de fonologia ABFW.",
};

export default async function AbfwPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <AbfwApplicationPageView patients={patients} />;
}
