"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClinicalEvolutionRecordRow } from "@/lib/supabase/database.types";

export type SaveClinicalEvolutionInput = {
  patientId: string;
  patientName: string;
  sessionDate: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
  professionalCouncil?: string;
  status?: "draft" | "finalized";
};

export type SaveClinicalEvolutionResult = {
  success: boolean;
  error?: string;
  record?: ClinicalEvolutionRecordRow;
};

export type LoadClinicalEvolutionResult = {
  success: boolean;
  error?: string;
  record: ClinicalEvolutionRecordRow | null;
};

export type ListDraftsResult = {
  success: boolean;
  error?: string;
  drafts: ClinicalEvolutionRecordRow[];
};

export async function saveClinicalEvolutionAction(
  input: SaveClinicalEvolutionInput
): Promise<SaveClinicalEvolutionResult> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
    };
  }

  const payload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    session_date: input.sessionDate,
    content_html: input.contentHtml,
    status: input.status ?? "draft",
    professional_name: input.professionalName,
    professional_role: input.professionalRole,
    professional_council: input.professionalCouncil ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .upsert(payload, {
      onConflict: "patient_id,session_date,professional_name",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    record: data,
  };
}

export async function loadClinicalEvolutionAction(
  patientId: string,
  sessionDate: string,
  professionalName: string
): Promise<LoadClinicalEvolutionResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      record: null,
    };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("session_date", sessionDate)
    .eq("professional_name", professionalName)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message,
      record: null,
    };
  }

  return {
    success: true,
    record: data,
  };
}

export async function listClinicalEvolutionDraftsAction(
  professionalName: string
): Promise<ListDraftsResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      drafts: [],
    };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("professional_name", professionalName)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    return {
      success: false,
      error: error.message,
      drafts: [],
    };
  }

  return {
    success: true,
    drafts: data ?? [],
  };
}

export type ListClinicalEvolutionsInput = {
  professionalName?: string;
  patientId?: string;
  fromDate?: string;
  toDate?: string;
  status?: "draft" | "finalized" | "all";
  limit?: number;
};

export type ListClinicalEvolutionsResult = {
  success: boolean;
  error?: string;
  records: ClinicalEvolutionRecordRow[];
  professionals: string[];
};

export async function listClinicalEvolutionsAction(
  input: ListClinicalEvolutionsInput = {}
): Promise<ListClinicalEvolutionsResult> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      records: [],
      professionals: [],
    };
  }

  let query = supabase
    .from("clinical_evolution_records")
    .select("*")
    .order("session_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(input.limit ?? 40);

  if (input.professionalName?.trim()) {
    query = query.ilike(
      "professional_name",
      `%${input.professionalName.trim()}%`
    );
  }

  if (input.patientId) {
    query = query.eq("patient_id", input.patientId);
  }

  if (input.fromDate) {
    query = query.gte("session_date", input.fromDate);
  }

  if (input.toDate) {
    query = query.lte("session_date", input.toDate);
  }

  if (input.status && input.status !== "all") {
    query = query.eq("status", input.status);
  }

  const [recordsResult, professionalsResult] = await Promise.all([
    query,
    supabase
      .from("clinical_evolution_records")
      .select("professional_name")
      .order("professional_name")
      .limit(500),
  ]);

  if (recordsResult.error) {
    return {
      success: false,
      error: recordsResult.error.message,
      records: [],
      professionals: [],
    };
  }

  const professionals = [
    ...new Set(
      (professionalsResult.data ?? [])
        .map((row) => row.professional_name)
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return {
    success: true,
    records: recordsResult.data ?? [],
    professionals,
  };
}
