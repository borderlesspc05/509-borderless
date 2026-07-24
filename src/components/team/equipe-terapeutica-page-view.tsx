"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Stethoscope, UserRound, Users } from "lucide-react";

import {
  getPatientTeamAction,
  savePatientTeamAction,
  type PatientTeamProfessional,
} from "@/app/actions/professional-team-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { AppSearchField } from "@/components/ui/app-search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";
import { useUserRole } from "@/hooks/use-user-role";
import {
  getProfessionalDisplaySubtitle,
  getProfessionalRoleLabel,
} from "@/lib/professional-format";
import { PERMISSIONS } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export type EquipePatientOption = {
  id: string;
  fullName: string;
};

type EquipeTerapeuticaPageViewProps = {
  patients: EquipePatientOption[];
  error?: string;
};

function setsAreEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) {
    return false;
  }

  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }

  return true;
}

export function EquipeTerapeuticaPageView({
  patients,
  error: pageError,
}: EquipeTerapeuticaPageViewProps) {
  const toast = useAppToast();
  const { hasPermission } = useUserRole();
  const canManageTeam = hasPermission(PERMISSIONS.TEAM_MANAGE);

  const [patientId, setPatientId] = useState("");
  const [professionals, setProfessionals] = useState<PatientTeamProfessional[]>(
    []
  );
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<
    Set<string>
  >(new Set());
  const [savedProfessionalIds, setSavedProfessionalIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const patientSelectItems = useMemo(
    () =>
      patients.map((patient) => ({
        label: patient.fullName,
        value: patient.id,
      })),
    [patients]
  );

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId) ?? null,
    [patients, patientId]
  );

  const isDirty = useMemo(
    () => !setsAreEqual(selectedProfessionalIds, savedProfessionalIds),
    [selectedProfessionalIds, savedProfessionalIds]
  );

  const loadTeam = useCallback(async (selectedPatientId: string) => {
    setIsLoading(true);
    setError(null);

    const result = await getPatientTeamAction(selectedPatientId);

    if (!result.success) {
      setError(result.error ?? "Não foi possível carregar a equipe.");
      setProfessionals([]);
      setSelectedProfessionalIds(new Set());
      setSavedProfessionalIds(new Set());
    } else {
      const loadedProfessionals = result.data?.professionals ?? [];
      const assignedIds = new Set(
        loadedProfessionals
          .filter((professional) => professional.isAssigned)
          .map((professional) => professional.id)
      );
      setProfessionals(loadedProfessionals);
      setSelectedProfessionalIds(assignedIds);
      setSavedProfessionalIds(new Set(assignedIds));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!patientId) {
      setProfessionals([]);
      setSelectedProfessionalIds(new Set());
      setSavedProfessionalIds(new Set());
      setError(null);
      setSearchQuery("");
      return;
    }

    setSearchQuery("");
    void loadTeam(patientId);
  }, [patientId, loadTeam]);

  const filteredProfessionals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const source = canManageTeam
      ? professionals
      : professionals.filter((professional) =>
          selectedProfessionalIds.has(professional.id)
        );

    if (!query) {
      return source;
    }

    return source.filter((professional) => {
      const roleLabel = getProfessionalRoleLabel(
        professional.professionalRole,
        professional.profileLabel
      );
      const haystack = [
        professional.fullName,
        roleLabel,
        professional.professionalCouncil,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [professionals, searchQuery, canManageTeam, selectedProfessionalIds]);

  const allFilteredSelected =
    filteredProfessionals.length > 0 &&
    filteredProfessionals.every((professional) =>
      selectedProfessionalIds.has(professional.id)
    );

  const someFilteredSelected =
    filteredProfessionals.some((professional) =>
      selectedProfessionalIds.has(professional.id)
    ) && !allFilteredSelected;

  function toggleProfessional(professionalId: string) {
    setSelectedProfessionalIds((current) => {
      const next = new Set(current);

      if (next.has(professionalId)) {
        next.delete(professionalId);
      } else {
        next.add(professionalId);
      }

      return next;
    });
  }

  function handleToggleAllFiltered() {
    setSelectedProfessionalIds((current) => {
      const next = new Set(current);

      if (allFilteredSelected) {
        filteredProfessionals.forEach((professional) =>
          next.delete(professional.id)
        );
      } else {
        filteredProfessionals.forEach((professional) =>
          next.add(professional.id)
        );
      }

      return next;
    });
  }

  function handleSave() {
    if (!selectedPatient || !canManageTeam || !isDirty) {
      return;
    }

    setError(null);

    startSaveTransition(async () => {
      const result = await savePatientTeamAction({
        patientId: selectedPatient.id,
        professionalIds: Array.from(selectedProfessionalIds),
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a equipe.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      toast.success({
        title: "Equipe atualizada",
        description: `${result.data?.assignedCount ?? 0} profissional(is) vinculado(s) a ${selectedPatient.fullName}.`,
      });

      void loadTeam(selectedPatient.id);
    });
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Equipe terapêutica"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Equipe terapêutica" },
        ]}
      />

      {pageError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pageError}
        </div>
      ) : (
        <div className="space-y-5">
          <section className="app-surface-card space-y-4 p-4 sm:p-5">
            <div className="space-y-1">
              <p className="app-section-title">Filtro</p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Escolha o aprendiz para visualizar e gerenciar os profissionais
                do acompanhamento.
              </p>
            </div>

            <div className="space-y-2 sm:max-w-md">
              <Label htmlFor="equipe-patient-filter">Aprendiz</Label>
              {patients.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                  Nenhum aprendiz ativo cadastrado.
                </p>
              ) : (
                <Select
                  value={patientId || null}
                  items={patientSelectItems}
                  onValueChange={(value) =>
                    setPatientId((value as string) ?? "")
                  }
                >
                  <SelectTrigger
                    id="equipe-patient-filter"
                    className="h-11 w-full"
                  >
                    <SelectValue placeholder="Selecione o aprendiz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.fullName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </section>

          {!patientId ? (
            <EmptyState
              icon={Users}
              title="Selecione um aprendiz"
              description="A equipe terapêutica aparece aqui depois que você escolhe o aprendiz no filtro acima."
            />
          ) : (
            <section className="app-surface-card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-border/60 bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Stethoscope className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-foreground">
                        Equipe de {selectedPatient?.fullName}
                      </h2>
                      <Badge variant="outline" className="rounded-md font-medium">
                        {selectedProfessionalIds.size} vinculado
                        {selectedProfessionalIds.size === 1 ? "" : "s"}
                      </Badge>
                      {isDirty ? (
                        <Badge
                          variant="outline"
                          className="rounded-md border-clinical-warning/30 bg-clinical-warning/10 font-medium text-clinical-warning"
                        >
                          Alterações pendentes
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {canManageTeam
                        ? "Marque os profissionais que acompanham este aprendiz."
                        : "Visualização da equipe vinculada ao aprendiz."}
                    </p>
                  </div>
                </div>

                {canManageTeam ? (
                  <Button
                    type="button"
                    className="h-11 shrink-0"
                    onClick={handleSave}
                    disabled={isSaving || isLoading || !isDirty}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Salvando...
                      </>
                    ) : (
                      "Salvar equipe"
                    )}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <AppSearchField
                  id="equipe-professional-search"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Buscar por nome ou cargo..."
                  disabled={isLoading}
                />

                {canManageTeam ? (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3 transition-colors hover:bg-muted/30">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border accent-primary"
                      checked={allFilteredSelected}
                      ref={(element) => {
                        if (element) {
                          element.indeterminate = someFilteredSelected;
                        }
                      }}
                      onChange={handleToggleAllFiltered}
                      disabled={isLoading || filteredProfessionals.length === 0}
                    />
                    <span className="text-sm font-medium text-foreground">
                      Marcar todos visíveis
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {selectedProfessionalIds.size} de {professionals.length}
                    </span>
                  </label>
                ) : null}

                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Carregando profissionais...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : filteredProfessionals.length === 0 ? (
                  <EmptyState
                    icon={UserRound}
                    title={
                      canManageTeam
                        ? professionals.length === 0
                          ? "Nenhum profissional disponível"
                          : "Nenhum resultado na busca"
                        : selectedProfessionalIds.size === 0
                          ? "Equipe ainda não definida"
                          : "Nenhum resultado na busca"
                    }
                    description={
                      canManageTeam
                        ? professionals.length === 0
                          ? "Cadastre profissionais ativos para montar a equipe deste aprendiz."
                          : "Ajuste o termo de busca para encontrar outros profissionais."
                        : selectedProfessionalIds.size === 0
                          ? "Quando um administrador vincular profissionais, eles aparecerão aqui."
                          : "Ajuste o termo de busca para encontrar outros profissionais."
                    }
                    className="border-0 bg-transparent px-0 py-10"
                  />
                ) : (
                  <ul className="grid gap-2.5">
                    {filteredProfessionals.map((professional) => {
                      const isChecked = selectedProfessionalIds.has(
                        professional.id
                      );
                      const roleLabel = getProfessionalRoleLabel(
                        professional.professionalRole,
                        professional.profileLabel
                      );
                      const subtitle = getProfessionalDisplaySubtitle(
                        null,
                        professional.professionalCouncil
                      );

                      return (
                        <li key={professional.id}>
                          <label
                            className={cn(
                              "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                              canManageTeam && "cursor-pointer",
                              isChecked
                                ? "border-primary/30 bg-primary/5"
                                : "border-border/70 hover:bg-muted/30"
                            )}
                          >
                            {canManageTeam ? (
                              <input
                                type="checkbox"
                                className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
                                checked={isChecked}
                                onChange={() =>
                                  toggleProfessional(professional.id)
                                }
                              />
                            ) : (
                              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserRound className="size-4" aria-hidden />
                              </div>
                            )}
                            <span className="min-w-0 flex-1 space-y-0.5">
                              <span className="block text-sm font-semibold text-foreground">
                                {professional.fullName}
                              </span>
                              <span className="block text-xs leading-relaxed text-muted-foreground">
                                {roleLabel}
                                {subtitle ? ` · ${subtitle}` : ""}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {!canManageTeam && !isLoading && !error ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Você pode visualizar a equipe. Apenas administradores podem
                    alterar os vínculos.
                  </p>
                ) : null}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
