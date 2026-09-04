"use client";

import { useCallback } from "react";

import { syncAgendaStatusAction } from "@/app/actions/internal-communication-actions";
import type { AppointmentStatus, DailyAppointment } from "@/lib/agenda-types";

export function useAgendaStatusSync() {
  const syncAppointmentStatus = useCallback(
    async (
      appointment: DailyAppointment,
      newStatus: AppointmentStatus
    ) => {
      const result = await syncAgendaStatusAction({
        appointmentId: appointment.id,
        patientName: appointment.patient,
        professionalName: appointment.professional,
        eventDate: appointment.date,
        startTime: appointment.time,
        endTime: appointment.endTime,
        status: newStatus,
      });

      if (!result.success) {
        console.error("[agenda-sync]", result.error);
        return { ok: false as const, error: result.error };
      }

      const syncedAppointment = result.data?.appointment;
      if (!syncedAppointment) {
        return {
          ok: false as const,
          error: "Status atualizado sem retorno do agendamento.",
        };
      }

      return { ok: true as const, appointment: syncedAppointment };
    },
    []
  );

  return { syncAppointmentStatus };
}
