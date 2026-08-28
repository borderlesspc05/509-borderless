"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { toggleProgramStatusAction } from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramCard,
  ProgramListRow,
} from "@/components/programs/program-card";
import { AppSearchField } from "@/components/ui/app-search-field";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  programStatusLabels,
  programVisibilityLabels,
  type ProgramListItem,
} from "@/lib/program-format";
import { PERMISSIONS } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";

type ProgramListProps = {
  programs: ProgramListItem[];
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | ProgramListItem["status"];
type VisibilityFilter = "all" | ProgramListItem["visibility"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(programStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

const visibilityFilterItems = [
  { label: "Todos os tipos", value: "all" },
  ...Object.entries(programVisibilityLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesProgramSearch(program: ProgramListItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    program.name,
    program.teaching_type,
    program.protocol,
    program.patientName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function ProgramList({ programs: initialPrograms }: ProgramListProps) {
  const toast = useAppToast();
  const { hasPermission } = useUserRole();
  const canManagePrograms = hasPermission(PERMISSIONS.PROGRAMS_MANAGE);
  const [programs, setPrograms] = useState(initialPrograms);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("private");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return programs.filter((program) => {
      const matchesStatus =
        statusFilter === "all" || program.status === statusFilter;
      const matchesVisibility =
        visibilityFilter === "all" || program.visibility === visibilityFilter;

      return (
        matchesStatus &&
        matchesVisibility &&
        matchesProgramSearch(program, normalizedQuery)
      );
    });
  }, [programs, searchQuery, statusFilter, visibilityFilter]);

  const hasActiveFilters = statusFilter !== "all";

  async function handleToggleStatus(program: ProgramListItem) {
    const result = await toggleProgramStatusAction(program.id);

    if (!result.success) {
      toast.error({
        title: "Falha ao alterar status",
        description: result.error ?? "Não foi possível alterar o programa.",
      });
      return;
    }

    if (result.data?.program) {
      setPrograms((current) =>
        current.map((item) =>
          item.id === program.id ? { ...item, ...result.data!.program } : item
        )
      );
    }

    toast.success({
      title: "Status atualizado",
      description: "O status do programa foi alterado.",
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {canManagePrograms ? (
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard/programas/novo" />}
          >
            <Plus className="size-4" aria-hidden />
            Novo Programa
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            type="button"
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon-sm"
            aria-label="Visualização em grade"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon-sm"
            aria-label="Visualização em lista"
            onClick={() => setViewMode("list")}
          >
            <List className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <section className="app-surface-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <AppSearchField
            id="program-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Busque por programas..."
            className="min-w-0 flex-1"
          />

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Select
              value={visibilityFilter}
              items={visibilityFilterItems}
              onValueChange={(value) =>
                setVisibilityFilter(value as VisibilityFilter)
              }
            >
              <SelectTrigger className="h-11 w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {visibilityFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary",
                      hasActiveFilters && "bg-primary/5"
                    )}
                  />
                }
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filtros
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,24rem)]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Refine a listagem de programas.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      items={statusFilterItems}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusFilterItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStatusFilter("all");
                        setSearchQuery("");
                      }}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setIsFiltersOpen(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {filteredPrograms.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhum programa encontrado"
          description={
            programs.length === 0
              ? "Ainda não há programas cadastrados."
              : "Ajuste a busca ou os filtros para ver outros resultados."
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onToggleStatus={canManagePrograms ? handleToggleStatus : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPrograms.map((program) => (
            <ProgramListRow
              key={program.id}
              program={program}
              onToggleStatus={canManagePrograms ? handleToggleStatus : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
