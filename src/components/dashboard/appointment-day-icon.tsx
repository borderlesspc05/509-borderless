import {
  CalendarClock,
  CalendarRange,
  CircleCheck,
  CircleDashed,
  CircleX,
  Hourglass,
  Megaphone,
  UserCheck,
  UserX,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/agenda-types";
import { appointmentStatusLabels } from "@/lib/appointment-status";

const statusIconConfig: Record<
  AppointmentStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  agendado: {
    icon: CalendarClock,
    className: "text-primary",
    label: appointmentStatusLabels.agendado,
  },
  em_espera: {
    icon: Hourglass,
    className: "text-[oklch(0.48_0.12_75)]",
    label: appointmentStatusLabels.em_espera,
  },
  confirmado: {
    icon: CircleCheck,
    className: "text-clinical-success",
    label: appointmentStatusLabels.confirmado,
  },
  atendido: {
    icon: UserCheck,
    className: "text-clinical-success",
    label: appointmentStatusLabels.atendido,
  },
  faltante: {
    icon: UserX,
    className: "text-destructive",
    label: appointmentStatusLabels.faltante,
  },
  cancelado: {
    icon: CircleX,
    className: "text-destructive",
    label: appointmentStatusLabels.cancelado,
  },
  encaixe: {
    icon: Zap,
    className: "text-violet-600",
    label: appointmentStatusLabels.encaixe,
  },
  reagendado: {
    icon: CalendarRange,
    className: "text-sky-600",
    label: appointmentStatusLabels.reagendado,
  },
  chamado: {
    icon: Megaphone,
    className: "text-primary",
    label: appointmentStatusLabels.chamado,
  },
};

type AppointmentDayIconProps = {
  status: AppointmentStatus;
  className?: string;
};

export function AppointmentDayIcon({
  status,
  className,
}: AppointmentDayIconProps) {
  const config = statusIconConfig[status] ?? {
    icon: CircleDashed,
    className: "text-muted-foreground",
    label: status,
  };
  const Icon = config.icon;

  return (
    <span
      title={config.label}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full bg-background/80 sm:size-6",
        className
      )}
    >
      <Icon className={cn("size-3 sm:size-3.5", config.className)} aria-hidden />
      <span className="sr-only">{config.label}</span>
    </span>
  );
}
