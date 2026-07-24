"use client";

import { ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AgendaAuditLogRow } from "@/lib/supabase/database.types";

type AuditLogTableProps = {
  logs: AgendaAuditLogRow[];
  isLoading?: boolean;
};

function formatPerformedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function getActionVariant(actionLabel: string) {
  if (actionLabel === "Cancelamento") {
    return "destructive" as const;
  }

  if (actionLabel === "Remanejamento") {
    return "secondary" as const;
  }

  return "outline" as const;
}

export function AuditLogTable({ logs, isLoading = false }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="app-surface-card flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
        Carregando registros de auditoria...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum registro encontrado"
        description="Ajuste o período ou o nome do paciente para ampliar a busca."
      />
    );
  }

  return (
    <div className="app-surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>De</TableHead>
            <TableHead>Para</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatPerformedAt(log.performed_at)}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium">{log.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.user_profile}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getActionVariant(log.action_label)}>
                  {log.action_label}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{log.patient_name}</TableCell>
              <TableCell className="max-w-56 whitespace-normal text-muted-foreground">
                {log.from_description}
              </TableCell>
              <TableCell className="max-w-56 whitespace-normal">
                {log.to_description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
