import type { AppointmentStatus, DailyAppointment } from "@/lib/agenda-types";
import { toDateKey } from "@/lib/calendar-utils";

export type BulkStatus = Extract<
  AppointmentStatus,
  "confirmado" | "cancelado" | "em_espera"
>;

export function requiresBulkConfirmation(
  status: AppointmentStatus
): status is BulkStatus {
  return (
    status === "confirmado" ||
    status === "cancelado" ||
    status === "em_espera"
  );
}

function namesMatch(left: string, right: string) {
  return (
    left.localeCompare(right, "pt-BR", { sensitivity: "accent" }) === 0
  );
}

export function isSamePatient(
  appointment: DailyAppointment,
  target: Pick<DailyAppointment, "patient" | "patientId">
) {
  if (target.patientId) {
    return appointment.patientId === target.patientId;
  }

  return namesMatch(appointment.patient, target.patient);
}

export function getPatientAppointmentsOnDate(
  appointments: DailyAppointment[],
  dateKey: string,
  target: Pick<DailyAppointment, "patient" | "patientId">
) {
  return appointments.filter(
    (appointment) =>
      appointment.date === dateKey && isSamePatient(appointment, target)
  );
}

/** @deprecated Use getPatientAppointmentsOnDate with an explicit dateKey. */
export function getPatientAppointmentsToday(
  appointments: DailyAppointment[],
  patientName: string,
  dateKey?: string
) {
  const target = appointments.find(
    (appointment) => appointment.patient === patientName
  );

  if (!target) {
    return [];
  }

  const resolvedDateKey = dateKey ?? toDateKey(new Date());

  return getPatientAppointmentsOnDate(appointments, resolvedDateKey, target);
}

export function getAffectedAppointmentIds(
  appointments: DailyAppointment[],
  appointmentId: string,
  applyToAllPatientOnDate: boolean,
  dateKey: string
) {
  const target = appointments.find(
    (appointment) => appointment.id === appointmentId
  );

  if (!target) {
    return [];
  }

  if (applyToAllPatientOnDate) {
    return getPatientAppointmentsOnDate(appointments, dateKey, target).map(
      (appointment) => appointment.id
    );
  }

  return [appointmentId];
}

export function applyStatusUpdate(
  appointments: DailyAppointment[],
  appointmentId: string,
  newStatus: AppointmentStatus,
  applyToAllPatientOnDate: boolean,
  dateKey: string
): DailyAppointment[] {
  const target = appointments.find(
    (appointment) => appointment.id === appointmentId
  );

  if (!target) {
    return appointments;
  }

  if (applyToAllPatientOnDate) {
    return appointments.map((appointment) =>
      appointment.date === dateKey && isSamePatient(appointment, target)
        ? { ...appointment, status: newStatus }
        : appointment
    );
  }

  return appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, status: newStatus }
      : appointment
  );
}
