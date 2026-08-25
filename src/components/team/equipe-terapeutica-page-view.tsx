"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, Stethoscope, UserRound, Users } from "lucide-react";

import {
  getPatientTeamAction,
  getProfessionalCaseloadAction,
  savePatientTeamAction,
  saveProfessionalCaseloadAction,
  type PatientTeamProfessional,
  type ProfessionalCaseloadPatient,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export type EquipeProfessionalOption = {
  id: string;
  fullName: string;
  professionalRole: string | null;
  profileLabel: string;
};

type EquipeTerapeuticaPageViewProps = {
  patients: EquipePatientOption[];
  professionals: EquipeProfessionalOption[];
  error?: string;
};

type Mode = "patient" | "professional";

function setsAreEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function EquipeTerapeuticaPageView({
  patients,
  professionals: professionalOptions,
  error: pageError,
}: EquipeTerapeuticaPageViewProps) {
  const toast = useAppToast();
  const { hasPermission } = useUserRole();
  const canManageTeam = hasPermission(PERMISSIONS.TEAM_MANAGE);

  const [mode, setMode] = useState<Mode>("patient");
  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [teamProfessionals, setTeamProfessionals] = useState<
    PatientTeamProfessional[]
  >([]);
  const [caseloadPatients, setCaseloadPatients] = useState<
    ProfessionalCaseloadPatient[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const patientSelectItems = useMemo(
    () => patients.map((p) => ({ label: p.fullName, value: p.id })),
    [patients]
  );

  const professionalSelectItems = useMemo(
    () =>
      professionalOptions.map((p) => ({
        label: p.fullName,
        value: p.id,
      })),
    [professionalOptions]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? null,
    [patients, patientId]
  );

  const selectedProfessional = useMemo(
    () => professionalOptions.find((p) => p.id === professionalId) ?? null,
    [professionalOptions, professionalId]
  );

  const isDirty = useMemo(
    () => !setsAreEqual(selectedIds, savedIds),
    [selectedIds, savedIds]
  );

  const loadPatientTeam = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const result = await getPatientTeamAction(id);
    if (!result.success) {
      setError(result.error ?? "Não foi possível carregar a equipe.");
      setTeamProfessionals([]);
      setSelectedIds(new Set());
      setSavedIds(new Set());
    } else {
      const list = result.data?.professionals ?? [];
      const assigned = new Set(
        list.filter((p) => p.isAssigned).map((p) => p.id)
      );
      setTeamProfessionals(list);
      setSelectedIds(assigned);
      setSavedIds(new Set(assigned));
    }
    setIsLoading(false);
  }, []);

  const loadProfessionalCaseload = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    const result = await getProfessionalCaseloadAction(id);
    if (!result.success) {
      setError(result.error ?? "Não foi possível carregar a caseload.");
      setCaseloadPatients([]);
      setSelectedIds(new Set());
      setSavedIds(new Set());
    } else {
      const list = result.data?.patients ?? [];
      const assigned = new Set(
        list.filter((p) => p.isAssigned).map((p) => p.id)
      );
      setCaseloadPatients(list);
      setSelectedIds(assigned);
      setSavedIds(new Set(assigned));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setSearchQuery("");
    setError(null);
    setSelectedIds(new Set());
    setSavedIds(new Set());
    setTeamProfessionals([]);
    setCaseloadPatients([]);

    if (mode === "patient") {
      if (patientId) void loadPatientTeam(patientId);
      return;
    }

    if (professionalId) void loadProfessionalCaseload(professionalId);
  }, [mode, patientId, professionalId, loadPatientTeam, loadProfessionalCaseload]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (mode === "patient") {
      const source = canManageTeam
        ? teamProfessionals
        : teamProfessionals.filter((p) => selectedIds.has(p.id));

      if (!query) return source.map((p) => ({ id: p.id, title: p.fullName, subtitle: getProfessionalRoleLabel(p.professionalRole, p.profileLabel) + (getProfessionalDisplaySubtitle(null, p.professionalCouncil) ? ` · ${getProfessionalDisplaySubtitle(null, p.professionalCouncil)}` : "") }));

      return source
        .filter((p) => {
          const haystack = [
            p.fullName,
            p.professionalRole,
            p.profileLabel,
            p.professionalCouncil,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        })
        .map((p) => ({
          id: p.id,
          title: p.fullName,
          subtitle:
            getProfessionalRoleLabel(p.professionalRole, p.profileLabel) +
            (getProfessionalDisplaySubtitle(null, p.professionalCouncil)
              ? ` · ${getProfessionalDisplaySubtitle(null, p.professionalCouncil)}`
              : ""),
        }));
    }

    const source = canManageTeam
      ? caseloadPatients
      : caseloadPatients.filter((p) => selectedIds.has(p.id));

    if (!query) {
      return source.map((p) => ({ id: p.id, title: p.fullName, subtitle: "Aprendiz" }));
    }

    return source
      .filter((p) => p.fullName.toLowerCase().includes(query))
      .map((p) => ({ id: p.id, title: p.fullName, subtitle: "Aprendiz" }));
  }, [
    mode,
    teamProfessionals,
    caseloadPatients,
    searchQuery,
    canManageTeam,
    selectedIds,
  ]);

  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.has(item.id));

  const someFilteredSelected =
    filteredItems.some((item) => selectedIds.has(item.id)) &&
    !allFilteredSelected;

  function toggleId(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleAllFiltered() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredItems.forEach((item) => next.delete(item.id));
      } else {
        filteredItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }

  function handleSave() {
    if (!canManageTeam || !isDirty) return;

    setError(null);

    startSaveTransition(async () => {
      if (mode === "patient") {
        if (!selectedPatient) return;
        const result = await savePatientTeamAction({
          patientId: selectedPatient.id,
          professionalIds: Array.from(selectedIds),
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
        void loadPatientTeam(selectedPatient.id);
        return;
      }

      if (!selectedProfessional) return;
      const result = await saveProfessionalCaseloadAction({
        professionalId: selectedProfessional.id,
        patientIds: Array.from(selectedIds),
      });
      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar a caseload.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }
      toast.success({
        title: "Caseload atualizada",
        description: `${result.data?.assignedCount ?? 0} aprendiz(es) vinculado(s) a ${selectedProfessional.fullName}.`,
      });
      void loadProfessionalCaseload(selectedProfessional.id);
    });
  }

  const entitySelected =
    mode === "patient" ? Boolean(patientId) : Boolean(professionalId);
  const headerTitle =
    mode === "patient"
      ? selectedPatient
        ? `Equipe de ${selectedPatient.fullName}`
        : "Equipe do aprendiz"
      : selectedProfessional
        ? `Aprendizes de ${selectedProfessional.fullName}`
        : "Caseload do profissional";

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
              <p className="app-section-title">Modo de organização</p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Monte a equipe pelo aprendiz ou pela caseload do profissional.
              </p>
            </div>

            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as Mode)}
            >
              <TabsList>
                <TabsTrigger value="patient">Por aprendiz</TabsTrigger>
                <TabsTrigger value="professional">Por profissional</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2 sm:max-w-md">
              {mode === "patient" ? (
                <>
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
                </>
              ) : (
                <>
                  <Label htmlFor="equipe-professional-filter">Profissional</Label>
                  {professionalOptions.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                      Nenhum profissional ativo cadastrado.
                    </p>
                  ) : (
                    <Select
                      value={professionalId || null}
                      items={professionalSelectItems}
                      onValueChange={(value) =>
                        setProfessionalId((value as string) ?? "")
                      }
                    >
                      <SelectTrigger
                        id="equipe-professional-filter"
                        className="h-11 w-full"
                      >
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {professionalOptions.map((professional) => (
                            <SelectItem
                              key={professional.id}
                              value={professional.id}
                            >
                              {professional.fullName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>
          </section>

          {!entitySelected ? (
            <EmptyState
              icon={Users}
              title={
                mode === "patient"
                  ? "Selecione um aprendiz"
                  : "Selecione um profissional"
              }
              description={
                mode === "patient"
                  ? "A equipe terapêutica aparece aqui depois que você escolhe o aprendiz."
                  : "Os aprendizes da caseload aparecem aqui depois que você escolhe o profissional."
              }
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
                        {headerTitle}
                      </h2>
                      <Badge variant="outline" className="rounded-md font-medium">
                        {selectedIds.size} vinculado
                        {selectedIds.size === 1 ? "" : "s"}
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
                        ? mode === "patient"
                          ? "Marque os profissionais que acompanham este aprendiz."
                          : "Marque os aprendizes sob responsabilidade deste profissional."
                        : "Visualização somente leitura dos vínculos."}
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
                      "Salvar vínculos"
                    )}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <AppSearchField
                  id="equipe-search"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={
                    mode === "patient"
                      ? "Buscar profissional..."
                      : "Buscar aprendiz..."
                  }
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
                      disabled={isLoading || filteredItems.length === 0}
                    />
                    <span className="text-sm font-medium text-foreground">
                      Marcar todos visíveis
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {selectedIds.size} selecionado
                      {selectedIds.size === 1 ? "" : "s"}
                    </span>
                  </label>
                ) : null}

                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Carregando...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <EmptyState
                    icon={UserRound}
                    title="Nenhum resultado"
                    description="Ajuste o filtro ou cadastre novos vínculos."
                    className="border-0 bg-transparent px-0 py-10"
                  />
                ) : (
                  <ul className="grid gap-2.5">
                    {filteredItems.map((item) => {
                      const isChecked = selectedIds.has(item.id);
                      return (
                        <li key={item.id}>
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
                                onChange={() => toggleId(item.id)}
                              />
                            ) : (
                              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserRound className="size-4" aria-hidden />
                              </div>
                            )}
                            <span className="min-w-0 flex-1 space-y-0.5">
                              <span className="block text-sm font-semibold text-foreground">
                                {item.title}
                              </span>
                              <span className="block text-xs leading-relaxed text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
