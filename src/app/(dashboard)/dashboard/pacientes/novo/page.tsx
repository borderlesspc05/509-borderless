import type { Metadata } from "next";

import { PatientCreatePageView } from "@/components/patients/patient-create-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Novo Aprendiz",
  description: "Cadastro de novo aprendiz na clínica.",
};

export default async function PatientCreatePage() {
  await requirePermission(PERMISSIONS.PATIENTS_MANAGE);

  return <PatientCreatePageView />;
}
