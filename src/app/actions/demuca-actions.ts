"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  calculateDemucaScore,
  countAnsweredDemucaItems,
  DEMUCA_INSTRUMENT,
  DEMUCA_ITEM_COUNT,
  DEMUCA_ITEMS,
  DEMUCA_DOMAINS,
  type DemucaAnswerSheet,
  type DemucaDomainScore,
  type DemucaEvaluationHistoryItem,
  type DemucaRating,
  type DemucaScoreResult,
} from "@/lib/demuca";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

function isDemucaRating(value: unknown): value is DemucaRating {
  return value === "N" || value === "P" || value === "M";
}

function validateDemucaSheet(sheet: DemucaAnswerSheet): string | null {
  if (!sheet.items || typeof sheet.items !== "object") {
    return "Folha de respostas inválida.";
  }

  for (const [itemId, value] of Object.entries(sheet.items)) {
    if (value === undefined) continue;
    if (!isDemucaRating(value)) {
      return "Cada item deve ser pontuado como N, P ou M.";
    }
    if (!DEMUCA_ITEMS.some((item) => item.id === itemId)) {
      return `Item desconhecido: ${itemId}`;
    }
  }

  return null;
}

function validateCalculableDemucaSheet(sheet: DemucaAnswerSheet): string | null {
  const validationError = validateDemucaSheet(sheet);
  if (validationError) {
    return validationError;
  }

  const answeredCount = countAnsweredDemucaItems(sheet.items);

  if (!sheet.allowPartial && answeredCount < DEMUCA_ITEM_COUNT) {
    return `Preencha todos os ${DEMUCA_ITEM_COUNT} itens ou habilite avaliação parcial.`;
  }

  if (sheet.allowPartial && answeredCount === 0) {
    return "Responda ao menos um item para calcular o escore parcial.";
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseDemucaHistoryDomains(
  contentHtml: string
): DemucaDomainScore[] | null {
  try {
    const payload: unknown = JSON.parse(contentHtml);
    if (!isRecord(payload) || !isRecord(payload.scores)) {
      return null;
    }

    const storedDomains = payload.scores.domains;
    if (!Array.isArray(storedDomains)) {
      return null;
    }

    const domains = DEMUCA_DOMAINS.flatMap((definition): DemucaDomainScore[] => {
      const stored = storedDomains.find(
        (candidate) =>
          isRecord(candidate) && candidate.domainId === definition.id
      );

      if (!isRecord(stored)) {
        return [];
      }

      return [
        {
          domainId: definition.id,
          domainLabel: definition.label,
          rawScore: finiteNumber(stored.rawScore),
          possibleScore: finiteNumber(stored.possibleScore),
          finalScore: Math.min(Math.max(finiteNumber(stored.finalScore), 0), 1),
          answeredCount: finiteNumber(stored.answeredCount),
          itemCount: finiteNumber(stored.itemCount),
        },
      ];
    });

    return domains.length === DEMUCA_DOMAINS.length ? domains : null;
  } catch {
    return null;
  }
}

export async function calculateDemucaScoreAction(
  sheet: DemucaAnswerSheet
): Promise<ActionResult<DemucaScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateCalculableDemucaSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const scores = calculateDemucaScore({
    items: sheet.items,
    allowPartial: sheet.allowPartial,
  });

  return { success: true, data: scores };
}

export type SaveDemucaEvaluationInput = {
  patientId: string;
  patientName: string;
  evaluationDate: string;
  items: Record<string, DemucaRating | undefined>;
  allowPartial: boolean;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
  notes?: string;
};

export async function listDemucaEvaluationHistoryAction(
  patientId: string
): Promise<ActionResult<{ evaluations: DemucaEvaluationHistoryItem[] }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!patientId.trim()) {
    return { success: true, data: { evaluations: [] } };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("evaluations")
    .select("id, evaluation_date, status, content_html")
    .eq("patient_id", patientId)
    .eq("instrument", DEMUCA_INSTRUMENT)
    .eq("status", "finalized")
    .order("evaluation_date", { ascending: false })
    .limit(5);

  if (error) {
    return { success: false, error: error.message };
  }

  const evaluations = (data ?? [])
    .flatMap((evaluation): DemucaEvaluationHistoryItem[] => {
      const domains = parseDemucaHistoryDomains(evaluation.content_html);
      if (!domains) {
        return [];
      }

      return [
        {
          id: evaluation.id,
          evaluationDate: evaluation.evaluation_date,
          status: evaluation.status,
          domains,
        },
      ];
    })
    .reverse();

  return { success: true, data: { evaluations } };
}

export async function saveDemucaEvaluationAction(
  input: SaveDemucaEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  const sheet = {
    items: input.items,
    allowPartial: input.allowPartial,
  } satisfies DemucaAnswerSheet;
  const validationError = validateCalculableDemucaSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const scores = calculateDemucaScore(sheet);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    instrument: DEMUCA_INSTRUMENT,
    evaluationDate: input.evaluationDate,
    allowPartial: input.allowPartial,
    items: input.items,
    scores,
    notes: input.notes?.trim() || undefined,
  };

  const status = input.status ?? "draft";
  const title = `DEMUCA — ${input.patientName} — ${input.evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: DEMUCA_INSTRUMENT,
      evaluation_date: input.evaluationDate || toDateKey(new Date()),
      content_html: JSON.stringify(payload),
      total_score: Number((scores.overallScore * 100).toFixed(2)),
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

  return { success: true, data: { evaluation: data } };
}
