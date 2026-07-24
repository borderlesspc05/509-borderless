"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuditLogFilters } from "@/app/actions/audit-log-actions";

type AuditLogFiltersProps = {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onSearch: () => void;
  onClear?: () => void;
  isLoading?: boolean;
};

export function AuditLogFiltersBar({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isLoading = false,
}: AuditLogFiltersProps) {
  function clearFilters() {
    onClear?.();
  }

  const hasFilters = Boolean(
    filters.startDate || filters.endDate || filters.patientName
  );

  return (
    <section className="app-surface-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="audit-start-date">Data inicial</Label>
          <Input
            id="audit-start-date"
            type="date"
            value={filters.startDate ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                startDate: event.target.value || undefined,
              })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audit-end-date">Data final</Label>
          <Input
            id="audit-end-date"
            type="date"
            value={filters.endDate ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                endDate: event.target.value || undefined,
              })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <Label htmlFor="audit-patient-name">Nome do paciente</Label>
          <Input
            id="audit-patient-name"
            type="search"
            placeholder="Buscar por paciente..."
            value={filters.patientName ?? ""}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                patientName: event.target.value || undefined,
              })
            }
            className="h-10"
          />
        </div>

        <div className="flex gap-2 md:col-span-2 lg:col-span-1">
          <Button
            type="button"
            className="h-10 flex-1 gap-2"
            onClick={onSearch}
            disabled={isLoading}
          >
            <Search className="size-4" aria-hidden />
            Buscar
          </Button>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0"
              onClick={clearFilters}
              aria-label="Limpar filtros"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
