import type { AppointmentStatus, DailyAppointment } from "@/lib/agenda-types";
import {
  filterAgendaProfessionalsByRole,
  getAgendaProfessionalRole,
  type AgendaProfessional,
} from "@/lib/agenda-professionals";
import type { ProfessionalRole } from "@/lib/professionals-data";
import {
  generateSlotsFromWindows,
  getWeekdayFromDateKey,
} from "@/lib/professional-availability";

export type AgendaAvailabilityFilter = "all" | "vacant";

export const AGENDA_APPOINTMENT_TYPES = [
  "avaliacao",
  "evolucao_diaria",
  "planejamento",
  "sessao",
  "supervisao",
  "suporte_escolar",
  "visita",
] as const;

export type AgendaAppointmentType = (typeof AGENDA_APPOINTMENT_TYPES)[number];

export const AGENDA_APPOINTMENT_TYPE_LABELS: Record<
  AgendaAppointmentType,
  string
> = {
  avaliacao: "Avaliação",
  evolucao_diaria: "Evolução Diária",
  planejamento: "Planejamento",
  sessao: "Sessão",
  supervisao: "Supervisão",
  suporte_escolar: "Suporte Escolar",
  visita: "Visita",
};

export type AgendaFilters = {
  appointmentType: AgendaAppointmentType | "all";
  role: ProfessionalRole | "all";
  location: string | "all";
  status: AppointmentStatus | "all";
  availability: AgendaAvailabilityFilter;
};

export const DEFAULT_AGENDA_FILTERS: AgendaFilters = {
  appointmentType: "all",
  role: "all",
  location: "all",
  status: "all",
  availability: "all",
};

export type VacantSlot = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  professional: string;
  role: ProfessionalRole | null;
};

function padHour(hour: number) {
  return String(hour).padStart(2, "0");
}

function buildClinicTimeSlots() {
  return Array.from({ length: 24 }, (_, hour) => ({
    time: `${padHour(hour)}:00`,
    endTime: hour === 23 ? "24:00" : `${padHour(hour + 1)}:00`,
  }));
}

/** Grade de 24h usada no novo agendamento, busca de horário e vagas padrão. */
export const CLINIC_TIME_SLOTS = buildClinicTimeSlots();

export { APPOINTMENT_STATUS_OPTIONS as AGENDA_STATUS_FILTER_OPTIONS } from "@/lib/appointment-status";

function isActiveAppointment(appointment: DailyAppointment) {
  return (
    appointment.status !== "cancelado" &&
    appointment.status !== "faltante" &&
    appointment.status !== "reagendado"
  );
}

function isSlotOccupied(
  appointments: DailyAppointment[],
  date: string,
  professional: string,
  slotTime: string
) {
  return appointments.some(
    (appointment) =>
      appointment.date === date &&
      appointment.professional === professional &&
      isActiveAppointment(appointment) &&
      appointment.time === slotTime
  );
}

function getSlotsForProfessional(
  professional: AgendaProfessional,
  date: string
) {
  const weekday = getWeekdayFromDateKey(date);
  const windows = professional.windowsByWeekday[weekday] ?? [];
  const hasConfiguredAvailability = Object.values(
    professional.windowsByWeekday
  ).some((dayWindows) => dayWindows.length > 0);

  if (hasConfiguredAvailability) {
    if (windows.length === 0) {
      return [];
    }

    return generateSlotsFromWindows(
      windows,
      professional.slotDurationMinutes
    );
  }

  return [...CLINIC_TIME_SLOTS];
}

export function countActiveFilters(filters: AgendaFilters) {
  let count = 0;

  if (filters.appointmentType !== "all") count += 1;
  if (filters.role !== "all") count += 1;
  if (filters.location !== "all") count += 1;
  if (filters.status !== "all") count += 1;
  if (filters.availability !== "all") count += 1;

  return count;
}

export function collectAgendaLocations(appointments: DailyAppointment[]) {
  const locations = new Set<string>();

  appointments.forEach((appointment) => {
    const room = appointment.roomName?.trim();
    if (room) {
      locations.add(room);
    }
  });

  return [...locations].sort((left, right) =>
    left.localeCompare(right, "pt-BR")
  );
}

export function filterAppointmentsByRole(
  appointments: DailyAppointment[],
  role: ProfessionalRole | "all",
  professionals: AgendaProfessional[]
) {
  if (role === "all") {
    return appointments;
  }

  return appointments.filter(
    (appointment) =>
      getAgendaProfessionalRole(
        professionals,
        appointment.professional,
        appointment.professionalUserId
      ) === role
  );
}

export function filterAppointmentsByAgendaFilters(
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
) {
  return appointments.filter((appointment) => {
    if (
      filters.appointmentType !== "all" &&
      appointment.appointmentType !== filters.appointmentType
    ) {
      return false;
    }

    if (filters.status !== "all" && appointment.status !== filters.status) {
      return false;
    }

    if (filters.location !== "all") {
      const room = appointment.roomName?.trim() ?? "";
      if (room !== filters.location) {
        return false;
      }
    }

    if (filters.role !== "all") {
      const role = getAgendaProfessionalRole(
        professionals,
        appointment.professional,
        appointment.professionalUserId
      );
      if (role !== filters.role) {
        return false;
      }
    }

    return true;
  });
}

export function getVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
): VacantSlot[] {
  const matchingProfessionals = filterAgendaProfessionalsByRole(
    professionals,
    filters.role
  );
  const vacantSlots: VacantSlot[] = [];

  matchingProfessionals.forEach((professional) => {
    const slots = getSlotsForProfessional(professional, date);

    slots.forEach((slot) => {
      if (
        !isSlotOccupied(appointments, date, professional.name, slot.time)
      ) {
        vacantSlots.push({
          id: `${date}-${professional.id}-${slot.time}`,
          date,
          time: slot.time,
          endTime: slot.endTime,
          professional: professional.name,
          role: professional.role,
        });
      }
    });
  });

  return vacantSlots.sort((a, b) => a.time.localeCompare(b.time));
}

export function countVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
) {
  return getVacantSlotsForDate(
    date,
    appointments,
    filters,
    professionals
  ).length;
}

export function hasVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
) {
  return countVacantSlotsForDate(date, appointments, filters, professionals) > 0;
}

export function isAgendaAppointmentType(
  value: string | null | undefined
): value is AgendaAppointmentType {
  return (
    typeof value === "string" &&
    (AGENDA_APPOINTMENT_TYPES as readonly string[]).includes(value)
  );
}
