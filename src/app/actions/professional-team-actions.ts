"use server";

import { requirePermission } from "@/lib/auth-guard";
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

export async function getPatientTeamAction(
  patientId: string
): Promise<
  ActionResult<{
    professionals: PatientTeamProfessional[];
    assignedCount: number;
  }>
> {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [professionalsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select(
        "id, full_name, professional_role, professional_council, profile, status"
      )
      .neq("profile", "RECEPCAO")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("professional_patient_assignments")
      .select("professional_id")
      .eq("patient_id", patientId),
  ]);

  if (professionalsResult.error) {
    return { success: false, error: professionalsResult.error.message };
  }

  if (assignmentsResult.error) {
    return { success: false, error: assignmentsResult.error.message };
  }

  const assignedProfessionalIds = new Set(
    (assignmentsResult.data ?? []).map((row) => row.professional_id)
  );

  const professionals = (professionalsResult.data ?? []).map((row) =>
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

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error: deleteError } = await supabase
    .from("professional_patient_assignments")
    .delete()
    .eq("patient_id", input.patientId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (input.professionalIds.length === 0) {
    return { success: true, data: { assignedCount: 0 } };
  }

  const rows = input.professionalIds.map((professionalId) => ({
    professional_id: professionalId,
    patient_id: input.patientId,
  }));

  const { error: insertError } = await supabase
    .from("professional_patient_assignments")
    .insert(rows);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return {
    success: true,
    data: { assignedCount: input.professionalIds.length },
  };
}
