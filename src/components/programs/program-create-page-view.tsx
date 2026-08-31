"use client";

import Link from "next/link";

import { ProgramGeneralTab } from "@/components/programs/program-general-tab";
import type { ProgramsPageMode } from "@/components/programs/programs-page-view";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import type { PatientRow } from "@/lib/supabase/database.types";

type ProgramCreatePageViewProps = {
  patients: PatientRow[];
  mode?: ProgramsPageMode;
};

export function ProgramCreatePageView({
  patients,
  mode = "catalog",
}: ProgramCreatePageViewProps) {
  const isLearnerMode = mode === "learner";

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title={isLearnerMode ? "Nova Programação" : "Novo Programa"}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: isLearnerMode ? "Evolução" : "Cadastro" },
          {
            label: isLearnerMode ? "Programações" : "Programas",
            href: isLearnerMode ? "/dashboard/programacoes" : "/dashboard/programas",
          },
          { label: "Novo" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={
                  isLearnerMode ? "/dashboard/programacoes" : "/dashboard/programas"
                }
              />
            }
          >
            Voltar
          </Button>
        }
      />

      <section className="app-surface-card overflow-hidden p-4 sm:p-6">
        <ProgramGeneralTab
          patients={patients}
          defaultRegistrationType={isLearnerMode ? "learner" : "catalog"}
          lockRegistrationType
        />
      </section>
    </PageContainer>
  );
}
