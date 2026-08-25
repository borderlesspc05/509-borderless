"use client";

import { ProgramList } from "@/components/programs/program-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { ProgramListItem } from "@/lib/program-format";

type ProgramsPageViewProps = {
  programs: ProgramListItem[];
  error?: string;
  focusLearnerPrograms?: boolean;
};

export function ProgramsPageView({
  programs,
  error,
  focusLearnerPrograms = false,
}: ProgramsPageViewProps) {
  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={focusLearnerPrograms ? "Programações" : "Programas"}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: focusLearnerPrograms ? "Evolução" : "Cadastro" },
          { label: focusLearnerPrograms ? "Programações" : "Programas" },
        ]}
      />

      {focusLearnerPrograms ? (
        <section className="app-surface-card space-y-2 p-4 text-sm text-muted-foreground sm:p-5">
          <p className="font-medium text-foreground">
            Programações dos aprendizes
          </p>
          <p>
            Cadastre e acompanhe programas vinculados a cada aprendiz. Use{" "}
            <span className="font-medium text-foreground">Novo programa</span> e
            escolha o tipo <span className="font-medium text-foreground">Programa de Aprendiz</span>.
          </p>
        </section>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ProgramList
          programs={
            focusLearnerPrograms
              ? programs.filter((program) => program.registration_type === "learner")
              : programs
          }
        />
      )}
    </PageContainer>
  );
}
