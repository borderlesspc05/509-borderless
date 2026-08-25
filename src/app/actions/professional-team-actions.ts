"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  syncPatientResponsibleProfessionals,
  syncProfessionalCaseload,
} from "@/lib/patient-access";
import { getProfileLabel } from "@/lib/user-profile";
import { normalizeRole, PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserProfileRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type PatientTeamProfessional = {
  id: string;
  fullName: string;
  professionalRole: string | null;
  profileLabel: string;
  professionalCouncil: string | null;
  isAssigned: boolean;
};

export type ProfessionalCaseloadPatient = {
  id: string;
  fullName: string;
  isAssigned: boolean;
};

function mapPatientTeamProfessional(
  row: Pick<
    UserProfileRow,
    "id" | "full_name" | "professional_role" | "professional_council" | "profile"
  >,
  isAssigned: boolean
): PatientTeamProfessional {
  const profile = normalizeRole(row.profile);

  return {
    id: row.id,
    fullName: row.full_name,
    professionalRole: row.professional_role,
    profileLabel: getProfileLabel(profile),
    professionalCouncil: row.professional_council,
    isAssigned,
  };
}

async function listActiveClinicalProfessionals(): Promise<
  | {
      ok: true;
      data: Pick<
        UserProfileRow,
        | "id"
        | "full_name"
        | "professional_role"
        | "professional_council"
        | "profile"
      >[];
    }
  | { ok: false; error: string }
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "id, full_name, professional_role, professional_council, profile, status"
    )
    .neq("profile", "RECEPCAO")
    .neq("profile", "FAMILIA")
    .eq("status", "active")
    .order("full_name");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data ?? [] };
}

export async function listAssignableProfessionalsAction(): Promise<
  ActionResult<{ professionals: PatientTeamProfessional[] }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const result = await listActiveClinicalProfessionals();

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    data: {
      professionals: result.data.map((row) =>
        mapPatientTeamProfessional(row, false)
      ),
    },
  };
}

export async function getPatientTeamAction(
  patientId: string
): Promise<
  ActionResult<{
    professionals: PatientTeamProfessional[];
    assignedCount: number;
  }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [professionalsResult, assignmentsResult] = await Promise.all([
    listActiveClinicalProfessionals(),
    supabase
      .from("professional_patient_assignments")
      .select("professional_id")
      .eq("patient_id", patientId),
  ]);

  if (!professionalsResult.ok) {
    return { success: false, error: professionalsResult.error };
  }

  if (assignmentsResult.error) {
    return { success: false, error: assignmentsResult.error.message };
  }

  const assignedProfessionalIds = new Set(
    (assignmentsResult.data ?? []).map((row) => row.professional_id)
  );

  const professionals = professionalsResult.data.map((row) =>
    mapPatientTeamProfessional(row, assignedProfessionalIds.has(row.id))
  );

  return {
    success: true,
    data: {
      professionals,
      assignedCount: assignedProfessionalIds.size,
    },
  };
}

export async function savePatientTeamAction(input: {
  patientId: string;
  professionalIds: string[];
}): Promise<ActionResult<{ assignedCount: number }>> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const syncResult = await syncPatientResponsibleProfessionals(
    input.patientId,
    input.professionalIds
  );

  if (!syncResult.ok) {
    return { success: false, error: syncResult.error };
  }

  return {
    success: true,
    data: {
      assignedCount: [...new Set(input.professionalIds.filter(Boolean))].length,
    },
  };
}

export async function getProfessionalCaseloadAction(
  professionalId: string
): Promise<
  ActionResult<{
    patients: ProfessionalCaseloadPatient[];
    assignedCount: number;
  }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [patientsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("patients")
      .select("id, full_name, status")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("professional_patient_assignments")
      .select("patient_id")
      .eq("professional_id", professionalId),
  ]);

  if (patientsResult.error) {
    return { success: false, error: patientsResult.error.message };
  }

  if (assignmentsResult.error) {
    return { success: false, error: assignmentsResult.error.message };
  }

  const assignedPatientIds = new Set(
    (assignmentsResult.data ?? []).map((row) => row.patient_id)
  );

  const patients = (patientsResult.data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    isAssigned: assignedPatientIds.has(row.id),
  }));

  return {
    success: true,
    data: {
      patients,
      assignedCount: assignedPatientIds.size,
    },
  };
}

export async function saveProfessionalCaseloadAction(input: {
  professionalId: string;
  patientIds: string[];
}): Promise<ActionResult<{ assignedCount: number }>> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const syncResult = await syncProfessionalCaseload(
    input.professionalId,
    input.patientIds
  );

  if (!syncResult.ok) {
    return { success: false, error: syncResult.error };
  }

  return {
    success: true,
    data: {
      assignedCount: [...new Set(input.patientIds.filter(Boolean))].length,
    },
  };
}
