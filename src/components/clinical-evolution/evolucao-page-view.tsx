"use client";

import { FileText } from "lucide-react";

import { ClinicalEvolutionForm } from "@/components/clinical-evolution/clinical-evolution-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";

type EvolucaoPageViewProps = {
  patients: ClinicalPatient[];
};

export function EvolucaoPageView({ patients }: EvolucaoPageViewProps) {
  return (
    <PageContainer>
      <DashboardPageHeader
        title="Evolução Clínica"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Atendimento" },
          { label: "Evolução Clínica" },
        ]}
      />

      <section className="app-surface-card p-4 text-sm text-muted-foreground sm:p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p>
            Registre a evolução da sessão em formato narrativo, salve rascunhos
            durante o atendimento e gere o relatório formal em PDF.
          </p>
        </div>
      </section>

      <ClinicalEvolutionForm patients={patients} />
    </PageContainer>
  );
}
