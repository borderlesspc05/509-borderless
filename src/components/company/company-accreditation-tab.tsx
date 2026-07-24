"use client";

import { Construction } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

export function CompanyAccreditationTab() {
  return (
    <EmptyState
      icon={Construction}
      title="Módulo de Credenciamento"
      description="Nenhum dado disponível no momento."
      className="py-16"
    />
  );
}
