"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type SaveFonoEvaluationInput = {
  patientId: string;
  patientName: string;
  evaluationDate: string;
  instrument: string;
  formData: Record<string, unknown>;
  filledCount: number;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
  totalScore?: number | null;
};

export async function saveFonoEvaluationAction(
  input: SaveFonoEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  if (!input.instrument.trim()) {
    return { success: false, error: "Instrumento obrigatório." };
  }

  if (input.filledCount <= 0) {
    return {
      success: false,
      error: "Preencha ao menos um campo da avaliação antes de salvar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const evaluationDate = input.evaluationDate || toDateKey(new Date());
  const status = input.status ?? "draft";

  const payload = {
    instrument: input.instrument,
    evaluationDate,
    formData: input.formData,
    filledCount: input.filledCount,
  };

  const title = `${input.instrument} — ${input.patientName} — ${evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: input.instrument,
      evaluation_date: evaluationDate,
      content_html: JSON.stringify(payload),
      total_score: input.totalScore ?? null,
      status,
      professional_name: input.professionalName,
      professional_role: input.professionalRole,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Falha ao salvar a avaliação.",
    };
  }

  revalidatePath("/dashboard/avaliacoes");
  revalidatePath(`/paciente/${input.patientId}/prontuario`);

  return { success: true, data: { evaluation: data } };
}
