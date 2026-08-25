"use client";

import Link from "next/link";
import { ClipboardList, PlayCircle } from "lucide-react";

import { AssessmentList } from "@/components/assessments/assessment-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import type { AssessmentTemplateRow } from "@/lib/supabase/database.types";

type AvaliacoesPageViewProps = {
  templates: AssessmentTemplateRow[];
  error?: string;
};

export function AvaliacoesPageView({ templates, error }: AvaliacoesPageViewProps) {
  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Avaliações e testes"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Avaliações e testes" },
        ]}
      />

      <section className="app-surface-card space-y-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Guia rápido de cadastro
            </p>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Cadastre o instrumento/teste nesta tela (nome, área e status).</li>
              <li>
                Depois aplique a avaliação no aprendiz em{" "}
                <span className="font-medium text-foreground">
                  Evolução → Aplicar avaliações
                </span>
                .
              </li>
              <li>
                Os resultados alimentam o prontuário e os relatórios de desempenho.
              </li>
            </ol>
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              className="gap-2"
              render={<Link href="/dashboard/avaliacoes/aplicar" />}
            >
              <PlayCircle className="size-4" />
              Ir para aplicar avaliações
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <AssessmentList templates={templates} />
      )}
    </PageContainer>
  );
}
