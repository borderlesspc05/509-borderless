import type { AppointmentStatus } from "@/lib/agenda-types";

/** Status usados no fluxo clínico da agenda (dropdown / filtros). */
export const APPOINTMENT_STATUS_OPTIONS = [
  { value: "agendado", label: "Agendado" },
  { value: "em_espera", label: "Em espera" },
  { value: "confirmado", label: "Confirmado" },
  { value: "atendido", label: "Atendido" },
  { value: "faltante", label: "Faltante" },
  { value: "cancelado", label: "Cancelado" },
  { value: "encaixe", label: "Encaixe" },
  { value: "reagendado", label: "Reagendado" },
] as const satisfies ReadonlyArray<{
  value: AppointmentStatus;
  label: string;
}>;

/** Status interno do painel de chamada — não aparece no seletor principal. */
export const CALL_PANEL_STATUS = "chamado" as const;

export const ALL_APPOINTMENT_STATUSES = [
  ...APPOINTMENT_STATUS_OPTIONS.map((option) => option.value),
  CALL_PANEL_STATUS,
] as const satisfies readonly AppointmentStatus[];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  em_espera: "Em espera",
  confirmado: "Confirmado",
  atendido: "Atendido",
  faltante: "Faltante",
  cancelado: "Cancelado",
  encaixe: "Encaixe",
  reagendado: "Reagendado",
  chamado: "Chamado",
};

export function getAppointmentStatusLabel(status: AppointmentStatus | string) {
  return (
    appointmentStatusLabels[status as AppointmentStatus] ?? status
  );
}
