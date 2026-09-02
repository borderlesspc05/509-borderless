"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserRole } from "@/hooks/use-user-role";
import {
  getApplicableAssessmentsForSession,
  groupAssessmentsByClinicalArea,
} from "@/lib/assessment-apply-routes";
import { canSeeAllClinicalAreas, normalizeRole } from "@/lib/rbac";

export function AvaliacoesAplicarPageView() {
  const { isMaster, profile, professionalRole } = useUserRole();
  const role = normalizeRole(profile);
  const instruments = getApplicableAssessmentsForSession({
    professionalRole,
    profile,
    isMaster,
    canManageAll: canSeeAllClinicalAreas(role, isMaster),
  });
  const groups = groupAssessmentsByClinicalArea(instruments);

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Avaliações"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Evolução" },
          { label: "Avaliações" },
        ]}
      />

      <p className="max-w-3xl text-sm text-muted-foreground">
        Instrumentos organizados por área clínica e especialidade. Cada
        profissional vê as avaliações da sua área (Fonoaudiologia, TO,
        Fisioterapia, Musicoterapia etc.).
      </p>

      {groups.length > 1 ? (
        <nav
          aria-label="Áreas clínicas"
          className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-muted/20 p-3"
        >
          {groups.map((group) => (
            <a
              key={group.area}
              href={`#area-${group.area}`}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              {group.label}
            </a>
          ))}
        </nav>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum instrumento para a sua área"
          description="Confirme se o cargo profissional está cadastrado corretamente (ex.: Fonoaudiólogo / Musicoterapeuta). Peça ao administrador para revisar o perfil."
        />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const total = group.specialties.reduce(
              (sum, specialty) => sum + specialty.items.length,
              0
            );

            return (
              <section
                key={group.area}
                id={`area-${group.area}`}
                className="scroll-mt-24 space-y-5"
              >
                <div className="space-y-1 border-b border-border/70 pb-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {group.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {total} instrumento{total === 1 ? "" : "s"} ·{" "}
                    {group.specialties.length} especialidade
                    {group.specialties.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="space-y-6">
                  {group.specialties.map((specialty) => (
                    <div key={specialty.specialty} className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {specialty.specialty}
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {specialty.items.map((instrument) => (
                          <article
                            key={`${group.area}-${instrument.name}`}
                            className="app-surface-card flex flex-col overflow-hidden"
                          >
                            <div className="flex flex-1 flex-col gap-3 p-5">
                              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ClipboardList className="size-5" aria-hidden />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground">
                                  {instrument.buttonLabel}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {instrument.description}
                                </p>
                              </div>
                            </div>
                            <div className="border-t border-border/60 bg-muted/20 p-3">
                              <Button
                                className="w-full"
                                nativeButton={false}
                                render={<Link href={instrument.href} />}
                              >
                                Avaliar paciente
                              </Button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
