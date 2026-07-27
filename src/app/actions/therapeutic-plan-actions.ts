"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PatientTherapeuticPlanRow } from "@/lib/supabase/database.types";

export type TherapeuticPlanRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  shortTermGoals: string;
  mediumTermGoals: string;
  longTermGoals: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function mapRow(row: PatientTherapeuticPlanRow): TherapeuticPlanRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    shortTermGoals: row.short_term_goals ?? "",
    mediumTermGoals: row.medium_term_goals ?? "",
    longTermGoals: row.long_term_goals ?? "",
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function revalidatePatientPaths(patientId: string) {
  revalidatePath(`/paciente/${patientId}/prontuario`);
  revalidatePath(`/dashboard/pacientes/${patientId}/editar`);
}

export async function getTherapeuticPlanAction(
  patientId: string
): Promise<ActionResult<{ plan: TherapeuticPlanRecord | null }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const { data, error } = await supabase
    .from("patient_therapeutic_plans")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) {
    console.error("Error loading therapeutic plan:", error);
    return {
      success: false,
      error: "Não foi possível carregar o planejamento terapêutico.",
    };
  }

  return {
    success: true,
    data: { plan: data ? mapRow(data) : null },
  };
}

export async function saveTherapeuticPlanAction({
  patientId,
  shortTermGoals,
  mediumTermGoals,
  longTermGoals,
  notes,
}: {
  patientId: string;
  shortTermGoals: string;
  mediumTermGoals: string;
  longTermGoals: string;
  notes?: string | null;
}): Promise<ActionResult<{ plan: TherapeuticPlanRecord }>> {
  const session = await requireServerUserSession();
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const payload = {
    patient_id: patientId,
    professional_id: session.id,
    short_term_goals: shortTermGoals.trim(),
    medium_term_goals: mediumTermGoals.trim(),
    long_term_goals: longTermGoals.trim(),
    notes: notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("patient_therapeutic_plans")
    .upsert(payload, { onConflict: "patient_id" })
    .select("*")
    .single();

  if (error) {
    console.error("Error saving therapeutic plan:", error);
    return {
      success: false,
      error: "Não foi possível salvar o planejamento terapêutico.",
    };
  }

  revalidatePatientPaths(patientId);
  return { success: true, data: { plan: mapRow(data) } };
}
