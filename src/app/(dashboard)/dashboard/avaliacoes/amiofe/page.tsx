import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { AmiofeApplicationPageView } from "@/components/assessments/fono/amiofe-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "AMIOFE",
  description: "Protocolo de Avaliação Miofuncional Orofacial com Escores.",
};

export default async function AmiofePage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <AmiofeApplicationPageView patients={patients} />;
}
