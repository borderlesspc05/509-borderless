import type { AppointmentStatus, DailyAppointment } from "@/lib/agenda-types";
import type { AgendaProfessional } from "@/lib/agenda-professionals";
import {
  getAppointmentConsultationDescription,
  getAppointmentSpecialtyLabel,
} from "@/lib/agenda-display-utils";
import { cn } from "@/lib/utils";

const statusPreviewClasses: Record<AppointmentStatus, string> = {
  agendado: "border-primary/30 bg-primary/10 text-primary",
  em_espera:
    "border-[oklch(0.65_0.14_75)]/40 bg-[oklch(0.65_0.14_75)]/15 text-[oklch(0.42_0.1_75)]",
  confirmado:
    "border-clinical-success/30 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]",
  atendido:
    "border-clinical-success/35 bg-clinical-success/15 text-[oklch(0.38_0.1_155)]",
  faltante: "border-destructive/30 bg-destructive/10 text-destructive",
  cancelado:
    "border-destructive/25 bg-destructive/10 text-destructive line-through",
  encaixe:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  reagendado:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  chamado: "border-primary/35 bg-primary/15 text-primary",
};

type AppointmentDayPreviewProps = {
  appointment: DailyAppointment;
  professionals: AgendaProfessional[];
  emphasizeSpecialty?: boolean;
  className?: string;
};

function formatTimeLabel(time: string) {
  return time.slice(0, 5);
}

export function AppointmentDayPreview({
  appointment,
  professionals,
  emphasizeSpecialty = false,
  className,
}: AppointmentDayPreviewProps) {
  const statusClass =
    statusPreviewClasses[appointment.status] ??
    "border-border bg-muted text-muted-foreground";

  const specialtyLabel = getAppointmentSpecialtyLabel(
    appointment,
    professionals
  );
  const consultationDescription = getAppointmentConsultationDescription(
    appointment,
    professionals
  );

  const title = emphasizeSpecialty
    ? `${formatTimeLabel(appointment.time)} · ${consultationDescription} · ${appointment.professional}`
    : `${formatTimeLabel(appointment.time)} · ${appointment.patient} · ${consultationDescription}`;

  return (
    <div
      title={title}
      className={cn(
        "w-full rounded-sm border px-1 py-0.5 text-left leading-tight",
        statusClass,
        className
      )}
    >
      <div className="flex items-center gap-1 truncate">
        <span className="shrink-0 text-[0.6rem] font-bold tabular-nums sm:text-[0.65rem]">
          {formatTimeLabel(appointment.time)}
        </span>
        {emphasizeSpecialty ? (
          <span className="truncate text-[0.6rem] font-semibold uppercase tracking-wide sm:text-[0.65rem]">
            {specialtyLabel}
          </span>
        ) : (
          <span className="truncate text-[0.6rem] font-medium sm:text-[0.65rem]">
            {appointment.patient}
          </span>
        )}
      </div>
      <p className="truncate text-[0.55rem] opacity-85 sm:text-[0.6rem]">
        {emphasizeSpecialty
          ? appointment.professional
          : specialtyLabel}
      </p>
    </div>
  );
}
