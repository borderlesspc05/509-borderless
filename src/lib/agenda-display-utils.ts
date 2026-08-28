import {
  AGENDA_APPOINTMENT_TYPE_LABELS,
  isAgendaAppointmentType,
} from "@/lib/agenda-filter-utils";
import {
  getAgendaProfessionalRole,
  type AgendaProfessional,
} from "@/lib/agenda-professionals";
import type { DailyAppointment } from "@/lib/agenda-types";
import type { ProfessionalRole } from "@/lib/professionals-data";

const ROLE_SHORT_LABELS: Record<ProfessionalRole, string> = {
  Psicólogo: "PSICOLOG",
  "Psicólogo(a)": "PSICOLOG",
  "Assistente Terapêutico (AT)": "AT",
  Coordenador: "COORD.",
  Fonoaudiólogo: "FONOAUDI",
  "Terapeuta Ocupacional": "T. OCUP.",
  "Supervisor Administrativo": "SUP. ADM.",
  Musicoterapeuta: "MUSICOTE",
  Neuropsicólogo: "NEUROPSI",
  Psicopedagoga: "PSICOPED",
  Fisioterapeuta: "FISIOTERA",
  Nutricionista: "NUTRI",
};

export function getProfessionalRoleShortLabel(role: ProfessionalRole | null) {
  if (!role) {
    return null;
  }

  return ROLE_SHORT_LABELS[role] ?? role.toUpperCase().slice(0, 8);
}

export function getAppointmentSpecialtyLabel(
  appointment: DailyAppointment,
  professionals: AgendaProfessional[]
) {
  const role = getAgendaProfessionalRole(
    professionals,
    appointment.professional,
    appointment.professionalUserId
  );

  const shortRole = getProfessionalRoleShortLabel(role);

  if (shortRole) {
    return shortRole;
  }

  if (
    appointment.appointmentType &&
    isAgendaAppointmentType(appointment.appointmentType)
  ) {
    return AGENDA_APPOINTMENT_TYPE_LABELS[appointment.appointmentType];
  }

  return "CONSULTA";
}

export function getAppointmentConsultationDescription(
  appointment: DailyAppointment,
  professionals: AgendaProfessional[]
) {
  const specialty = getAppointmentSpecialtyLabel(appointment, professionals);

  if (
    appointment.appointmentType &&
    isAgendaAppointmentType(appointment.appointmentType)
  ) {
    const typeLabel = AGENDA_APPOINTMENT_TYPE_LABELS[appointment.appointmentType];
    return `${specialty} · ${typeLabel}`;
  }

  return specialty;
}
