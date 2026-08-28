import { hasPermission, normalizeRole, PERMISSIONS, ROLES, type Role } from "@/lib/rbac";
import type { AppUserSession } from "@/lib/user-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Admin/Colaborador: sessão com qualquer aprendiz sem vínculo na equipe. */
const SESSION_ANY_PATIENT_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.COLABORADOR,
];

/** Perfis que listam todos os aprendizes (agenda, cadastro, supervisão). */
const LIST_ALL_PATIENTS_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.COLABORADOR,
  ROLES.RECEPCAO,
  ROLES.SUPERVISOR,
  ROLES.COORDENADOR,
];

export function sessionHasBroadPatientAccess(session: AppUserSession): boolean {
  if (session.isMaster) {
    return true;
  }

  return SESSION_ANY_PATIENT_ROLES.includes(normalizeRole(session.profile));
}

export function sessionCanListAllPatients(session: AppUserSession): boolean {
  if (session.isMaster) {
    return true;
  }

  return LIST_ALL_PATIENTS_ROLES.includes(normalizeRole(session.profile));
}

export function sessionCanManagePatients(session: AppUserSession): boolean {
  if (session.isMaster) {
    return true;
  }

  return hasPermission(
    session.profile,
    PERMISSIONS.PATIENTS_MANAGE,
    session.isMaster
  );
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

/** Sincroniza a caseload de um profissional (aprendizes sob sua responsabilidade). */
export async function syncProfessionalCaseload(
  professionalId: string,
  patientIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const uniqueIds = [...new Set(patientIds.filter(Boolean))];

  const { data: existing, error: existingError } = await supabase
    .from("professional_patient_assignments")
    .select("patient_id")
    .eq("professional_id", professionalId);

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  const currentIds = new Set((existing ?? []).map((row) => row.patient_id));
  const nextIds = new Set(uniqueIds);

  const toRemove = [...currentIds].filter((id) => !nextIds.has(id));
  const toAdd = [...nextIds].filter((id) => !currentIds.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("professional_patient_assignments")
      .delete()
      .eq("professional_id", professionalId)
      .in("patient_id", toRemove);

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("professional_patient_assignments")
      .insert(
        toAdd.map((patientId) => ({
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
