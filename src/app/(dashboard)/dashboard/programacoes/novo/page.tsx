import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { ProgramCreatePageView } from "@/components/programs/program-create-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Nova Programação",
  description: "Aplicar programa a um aprendiz.",
};

export default async function ProgramacaoCreatePage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();

  return (
    <ProgramCreatePageView
      patients={patientsResult.success ? (patientsResult.data?.patients ?? []) : []}
      mode="learner"
    />
  );
}
