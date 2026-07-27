"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  countDiccaoFilledFields,
  createEmptyDiccaoFormData,
  DICCAO_INSTRUMENT,
  type DiccaoFormData,
} from "@/lib/diccao";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type SaveDiccaoEvaluationInput = {
  patientId: string;
  patientName: string;
  evaluationDate: string;
  formData: DiccaoFormData;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateDiccaoForm(formData: DiccaoFormData): string | null {
  if (!isPlainObject(formData)) {
    return "Formulário inválido.";
  }

  if (countDiccaoFilledFields(formData) === 0) {
    return "Preencha ao menos um campo da avaliação antes de salvar.";
  }

  return null;
}

export async function saveDiccaoEvaluationAction(
  input: SaveDiccaoEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  const formData = {
    ...createEmptyDiccaoFormData(),
    ...input.formData,
  };

  const validationError = validateDiccaoForm(formData);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const evaluationDate = input.evaluationDate || toDateKey(new Date());
  const status = input.status ?? "draft";
  const filledCount = countDiccaoFilledFields(formData);

  const payload = {
    instrument: DICCAO_INSTRUMENT,
    evaluationDate,
    formData,
    filledCount,
  };

  const title = `${DICCAO_INSTRUMENT} — ${input.patientName} — ${evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: DICCAO_INSTRUMENT,
      evaluation_date: evaluationDate,
      content_html: JSON.stringify(payload),
      total_score: null,
      status,
      professional_name: input.professionalName,
      professional_role: input.professionalRole,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/avaliacoes");
  revalidatePath(`/paciente/${input.patientId}/prontuario`);

  return { success: true, data: { evaluation: data } };
}
