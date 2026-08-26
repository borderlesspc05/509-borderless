import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { MotricidadeApplicationPageView } from "@/components/assessments/fono/motricidade-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Motricidade Orofacial",
  description: "Avaliação fonoaudiológica infantil de motricidade orofacial.",
};

export default async function MotricidadePage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);
  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <MotricidadeApplicationPageView patients={patients} />;
}
