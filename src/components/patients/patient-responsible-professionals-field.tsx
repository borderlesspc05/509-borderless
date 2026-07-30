"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";

import {
  getPatientTeamAction,
  listAssignableProfessionalsAction,
  type PatientTeamProfessional,
} from "@/app/actions/professional-team-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PatientResponsibleProfessionalsFieldProps = {
  patientId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function PatientResponsibleProfessionalsField({
  patientId,
  selectedIds,
  onChange,
  disabled = false,
}: PatientResponsibleProfessionalsFieldProps) {
  const [professionals, setProfessionals] = useState<PatientTeamProfessional[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const result = patientId
        ? await getPatientTeamAction(patientId)
        : await listAssignableProfessionalsAction();

      if (cancelled) return;

      if (!result.success) {
        setError(result.error ?? "Não foi possível carregar profissionais.");
        setProfessionals([]);
        setIsLoading(false);
        return;
      }

      setProfessionals(result.data?.professionals ?? []);
      setIsLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredProfessionals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return professionals;

    return professionals.filter((professional) => {
      const haystack = [
        professional.fullName,
        professional.professionalRole ?? "",
        professional.profileLabel,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [professionals, searchQuery]);

  function toggleProfessional(id: string) {
    if (disabled) return;

    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((current) => current !== id));
      return;
    }

    onChange([...selectedIds, id]);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">
          Profissionais responsáveis
        </Label>
        <p className="text-sm text-muted-foreground">
          Somente estes profissionais (além de MASTER/admin) acessam o conteúdo
          clínico deste aprendiz.
        </p>
      </div>

      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Buscar por nome ou cargo..."
        className="h-11"
        disabled={disabled || isLoading}
      />

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border/70 p-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando profissionais...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum profissional encontrado"
            description="Cadastre profissionais ativos ou ajuste a busca."
            className="border-0 bg-transparent px-0 py-8"
          />
        ) : (
          <ul className="grid gap-2">
            {filteredProfessionals.map((professional) => {
              const isChecked = selectedSet.has(professional.id);

              return (
                <li key={professional.id}>
                  <label
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                      !disabled && "cursor-pointer",
                      isChecked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/70 hover:bg-muted/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => toggleProfessional(professional.id)}
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-medium text-foreground">
                        {professional.fullName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {professional.professionalRole ||
                          professional.profileLabel}
                        {professional.professionalCouncil
                          ? ` · ${professional.professionalCouncil}`
                          : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} profissional(is) selecionado(s)
      </p>
    </div>
  );
}
