import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { listProfessionalsAction } from "@/app/actions/team-actions";
import { ProfissionaisPageView } from "@/components/team/profissionais-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Profissionais",
  description: "Cadastro e gestão dos profissionais clínicos.",
};

type ProfissionaisPageProps = {
  searchParams: Promise<{ aba?: string | string[] }>;
};

export default async function ProfissionaisPage({
  searchParams,
}: ProfissionaisPageProps) {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const params = await searchParams;
  const aba = Array.isArray(params.aba) ? params.aba[0] : params.aba;

  if (aba === "equipe") {
    redirect("/dashboard/equipe-terapeutica");
  }

  const result = await listProfessionalsAction();

  return (
    <ProfissionaisPageView
      professionals={result.success ? (result.data?.professionals ?? []) : []}
      error={result.success ? undefined : result.error}
    />
  );
}
