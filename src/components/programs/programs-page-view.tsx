"use client";

import { ProgramList } from "@/components/programs/program-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { ProgramListItem } from "@/lib/program-format";

export type ProgramsPageMode = "catalog" | "learner";

type ProgramsPageViewProps = {
  programs: ProgramListItem[];
  error?: string;
  mode?: ProgramsPageMode;
};

export function ProgramsPageView({
  programs,
  error,
  mode = "catalog",
}: ProgramsPageViewProps) {
  const isLearnerMode = mode === "learner";

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={isLearnerMode ? "Programações" : "Programas"}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: isLearnerMode ? "Evolução" : "Cadastro" },
          { label: isLearnerMode ? "Programações" : "Programas" },
        ]}
      />

      {isLearnerMode ? (
        <section className="app-surface-card space-y-2 p-4 text-sm text-muted-foreground sm:p-5">
          <p className="font-medium text-foreground">Aplicação de treinos aos aprendizes</p>
          <p>
            Cadastre e acompanhe programações vinculadas a cada aprendiz. Os modelos de
            treino são criados em{" "}
            <span className="font-medium text-foreground">Cadastro → Programas</span>.
          </p>
        </section>
      ) : (
        <section className="app-surface-card space-y-2 p-4 text-sm text-muted-foreground sm:p-5">
          <p className="font-medium text-foreground">Catálogo de programas (treinos)</p>
          <p>
            Cadastre modelos reutilizáveis de programas ABA. Para aplicar um treino a um
            aprendiz, use{" "}
            <span className="font-medium text-foreground">Evolução → Programações</span>.
          </p>
        </section>
      )}

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ProgramList
          programs={programs.filter((program) =>
            isLearnerMode
              ? program.registration_type === "learner"
              : program.registration_type === "catalog"
          )}
          mode={mode}
        />
      )}
    </PageContainer>
  );
}
