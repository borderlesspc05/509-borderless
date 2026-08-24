import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { NutritionPageView } from "@/components/nutrition/nutrition-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Nutrição",
  description:
    "Módulo de atendimento nutricional com anamnese, antropometria, plano alimentar e orientações.",
};

export default async function NutritionPage() {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <NutritionPageView patients={patients} />;
}
