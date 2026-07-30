import { ROLES, normalizeRole, type Role } from "@/lib/rbac";
import type { AppUserSession } from "@/lib/user-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BROAD_ACCESS_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
];

export function sessionHasBroadPatientAccess(session: AppUserSession): boolean {
  if (session.isMaster) {
    return true;
  }

  return BROAD_ACCESS_ROLES.includes(normalizeRole(session.profile));
}

export async function assertPatientAccess(
  patientId: string,
  session: AppUserSession
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (sessionHasBroadPatientAccess(session)) {
    return { ok: true };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("professional_patient_assignments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("professional_id", session.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return {
      ok: false,
      error: "Você não está atribuído como responsável por este paciente.",
    };
  }

  return { ok: true };
}

export async function syncPatientResponsibleProfessionals(
  patientId: string,
  professionalIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const uniqueIds = [...new Set(professionalIds.filter(Boolean))];

  const { data: existing, error: existingError } = await supabase
    .from("professional_patient_assignments")
    .select("professional_id")
    .eq("patient_id", patientId);

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  const currentIds = new Set(
    (existing ?? []).map((row) => row.professional_id)
  );
  const nextIds = new Set(uniqueIds);

  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));
  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("professional_patient_assignments")
      .delete()
      .eq("patient_id", patientId)
      .in("professional_id", toRemove);

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("professional_patient_assignments")
      .insert(
        toAdd.map((professionalId) => ({
          patient_id: patientId,
          professional_id: professionalId,
        }))
      );

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  return { ok: true };
}
