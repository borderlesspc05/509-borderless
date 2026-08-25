import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/agenda-types";
import { appointmentStatusLabels } from "@/lib/appointment-status";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  agendado: {
    label: appointmentStatusLabels.agendado,
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  em_espera: {
    label: appointmentStatusLabels.em_espera,
    className:
      "border-clinical-warning/30 bg-clinical-warning/20 font-semibold text-[oklch(0.45_0.12_75)]",
  },
  confirmado: {
    label: appointmentStatusLabels.confirmado,
    className:
      "border-clinical-success/20 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]",
  },
  atendido: {
    label: appointmentStatusLabels.atendido,
    className:
      "border-clinical-success/30 bg-clinical-success/15 font-semibold text-[oklch(0.4_0.1_155)]",
  },
  faltante: {
    label: appointmentStatusLabels.faltante,
    className:
      "border-destructive/25 bg-destructive/10 text-destructive",
  },
  cancelado: {
    label: appointmentStatusLabels.cancelado,
    className:
      "border-destructive/20 bg-destructive/10 text-destructive line-through decoration-destructive/60",
  },
  encaixe: {
    label: appointmentStatusLabels.encaixe,
    className:
      "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  reagendado: {
    label: appointmentStatusLabels.reagendado,
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  chamado: {
    label: appointmentStatusLabels.chamado,
    className:
      "border-primary/30 bg-primary/15 font-semibold text-primary",
  },
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentStatusBadge({
  status,
  className,
}: AppointmentStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "border-border bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={cn("h-6 px-2.5 text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
