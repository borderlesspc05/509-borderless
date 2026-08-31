import type { Metadata } from "next";

import { listProgramsAction } from "@/app/actions/program-actions";
import { ProgramsPageView } from "@/components/programs/programs-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Programações",
  description: "Aplicação de programas aos aprendizes.",
};

export default async function ProgramacoesPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const result = await listProgramsAction();

  return (
    <ProgramsPageView
      programs={result.success ? (result.data?.programs ?? []) : []}
      error={result.success ? undefined : result.error}
      mode="learner"
    />
  );
}
