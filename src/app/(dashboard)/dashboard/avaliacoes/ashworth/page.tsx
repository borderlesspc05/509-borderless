import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { AshworthApplicationPageView } from "@/components/assessments/fisio/ashworth-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Escala de Ashworth Modificada",
  description: "Tabela da Escala Modificada de Ashworth para tônus / espasticidade.",
};

export default async function AshworthPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <AshworthApplicationPageView patients={patients} />;
}
