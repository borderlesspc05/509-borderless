"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth-guard";
import { assertPatientAccess } from "@/lib/patient-access";
import { PERMISSIONS } from "@/lib/rbac";
import type {
  AdultAnthropometryData,
  AnthropometryRecordType,
  ChildAnthropometryData,
  EnergyPopulation,
  MealPlanMeal,
  MealPlanMacros,
  NutritionAnamnesisRecord,
  NutritionAnthropometryRecord,
  NutritionEnergyRecord,
  NutritionFood,
  NutritionMealPlanRecord,
  NutritionTemplateRecord,
  PatientNutritionDocumentRecord,
  PregnantAnthropometryData,
} from "@/lib/nutrition/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function revalidateNutritionPaths(patientId: string) {
  revalidatePath(`/paciente/${patientId}/prontuario`);
  revalidatePath("/dashboard/nutricao");
}

async function requirePatientAccess(patientId: string) {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  const access = await assertPatientAccess(patientId, session);
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }
  return { ok: true as const, session };
}

async function getDb() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  return supabase as any;
}

// ─── Anamnese ───────────────────────────────────────────────────────────────

export async function listNutritionAnamnesisAction(
  patientId: string
): Promise<ActionResult<{ records: NutritionAnamnesisRecord[] }>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { data, error } = await db
    .from("patient_nutrition_anamnesis")
    .select("*")
    .eq("patient_id", patientId)
    .order("consultation_date", { ascending: false });

  if (error) {
    console.error(error);
    return { success: false, error: "Não foi possível carregar anamneses." };
  }

  return {
    success: true,
    data: {
      records: (data ?? []).map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        professionalId: row.professional_id,
        consultationDate: row.consultation_date,
        content: row.content ?? "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    },
  };
}

export async function saveNutritionAnamnesisAction(input: {
  patientId: string;
  id?: string;
  consultationDate: string;
  content: string;
}): Promise<ActionResult<{ record: NutritionAnamnesisRecord }>> {
  const access = await requirePatientAccess(input.patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const payload = {
    patient_id: input.patientId,
    professional_id: access.session.id,
    consultation_date: input.consultationDate,
    content: input.content.trim(),
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? db.from("patient_nutrition_anamnesis").update(payload).eq("id", input.id).select("*").single()
    : db.from("patient_nutrition_anamnesis").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) {
    console.error(error);
    return { success: false, error: "Não foi possível salvar a anamnese." };
  }

  revalidateNutritionPaths(input.patientId);
  return {
    success: true,
    data: {
      record: {
        id: data.id,
        patientId: data.patient_id,
        professionalId: data.professional_id,
        consultationDate: data.consultation_date,
        content: data.content ?? "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
  };
}

export async function deleteNutritionAnamnesisAction(
  patientId: string,
  id: string
): Promise<ActionResult<null>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { error } = await db.from("patient_nutrition_anamnesis").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Não foi possível excluir a anamnese." };
  }

  revalidateNutritionPaths(patientId);
  return { success: true, data: null };
}

// ─── Antropometria ──────────────────────────────────────────────────────────

export async function listNutritionAnthropometryAction(
  patientId: string,
  recordType?: AnthropometryRecordType
): Promise<ActionResult<{ records: NutritionAnthropometryRecord[] }>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  let query = db
    .from("patient_nutrition_anthropometry")
    .select("*")
    .eq("patient_id", patientId)
    .order("consultation_date", { ascending: false });

  if (recordType) {
    query = query.eq("record_type", recordType);
  }

  const { data, error } = await query;
  if (error) {
    return { success: false, error: "Não foi possível carregar antropometria." };
  }

  return {
    success: true,
    data: {
      records: (data ?? []).map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        professionalId: row.professional_id,
        recordType: row.record_type as AnthropometryRecordType,
        consultationDate: row.consultation_date,
        formData: row.form_data as
          | AdultAnthropometryData
          | ChildAnthropometryData
          | PregnantAnthropometryData,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    },
  };
}

export async function saveNutritionAnthropometryAction(input: {
  patientId: string;
  id?: string;
  recordType: AnthropometryRecordType;
  consultationDate: string;
  formData:
    | AdultAnthropometryData
    | ChildAnthropometryData
    | PregnantAnthropometryData;
}): Promise<ActionResult<{ record: NutritionAnthropometryRecord }>> {
  const access = await requirePatientAccess(input.patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const payload = {
    patient_id: input.patientId,
    professional_id: access.session.id,
    record_type: input.recordType,
    consultation_date: input.consultationDate,
    form_data: input.formData,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? db.from("patient_nutrition_anthropometry").update(payload).eq("id", input.id).select("*").single()
    : db.from("patient_nutrition_anthropometry").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) {
    console.error(error);
    return { success: false, error: "Não foi possível salvar antropometria." };
  }

  revalidateNutritionPaths(input.patientId);
  return {
    success: true,
    data: {
      record: {
        id: data.id,
        patientId: data.patient_id,
        professionalId: data.professional_id,
        recordType: data.record_type as AnthropometryRecordType,
        consultationDate: data.consultation_date,
        formData: data.form_data as
          | AdultAnthropometryData
          | ChildAnthropometryData
          | PregnantAnthropometryData,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
  };
}

export async function deleteNutritionAnthropometryAction(
  patientId: string,
  id: string
): Promise<ActionResult<null>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { error } = await db.from("patient_nutrition_anthropometry").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Não foi possível excluir o registro." };
  }

  revalidateNutritionPaths(patientId);
  return { success: true, data: null };
}

// ─── Energia ────────────────────────────────────────────────────────────────

export async function listNutritionEnergyAction(
  patientId: string
): Promise<ActionResult<{ records: NutritionEnergyRecord[] }>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { data, error } = await db
    .from("patient_nutrition_energy")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: "Não foi possível carregar cálculos." };
  }

  return {
    success: true,
    data: {
      records: (data ?? []).map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        professionalId: row.professional_id,
        population: row.population as EnergyPopulation,
        formula: row.formula,
        formData: row.form_data as Record<string, unknown>,
        resultData: row.result_data as Record<string, unknown>,
        createdAt: row.created_at,
      })),
    },
  };
}

export async function saveNutritionEnergyAction(input: {
  patientId: string;
  population: EnergyPopulation;
  formula: string;
  formData: Record<string, unknown>;
  resultData: Record<string, unknown>;
}): Promise<ActionResult<{ record: NutritionEnergyRecord }>> {
  const access = await requirePatientAccess(input.patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { data, error } = await db
    .from("patient_nutrition_energy")
    .insert({
      patient_id: input.patientId,
      professional_id: access.session.id,
      population: input.population,
      formula: input.formula,
      form_data: input.formData,
      result_data: input.resultData,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível salvar o cálculo." };
  }

  revalidateNutritionPaths(input.patientId);
  return {
    success: true,
    data: {
      record: {
        id: data.id,
        patientId: data.patient_id,
        professionalId: data.professional_id,
        population: data.population as EnergyPopulation,
        formula: data.formula,
        formData: data.form_data as Record<string, unknown>,
        resultData: data.result_data as Record<string, unknown>,
        createdAt: data.created_at,
      },
    },
  };
}

// ─── Alimentos ──────────────────────────────────────────────────────────────

export async function searchNutritionFoodsAction(
  query: string
): Promise<ActionResult<{ foods: NutritionFood[] }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  let dbQuery = db.from("nutrition_foods").select("*").order("name").limit(50);
  if (query.trim()) {
    dbQuery = dbQuery.ilike("name", `%${query.trim()}%`);
  }

  const { data, error } = await dbQuery;
  if (error) {
    return { success: false, error: "Não foi possível buscar alimentos." };
  }

  return {
    success: true,
    data: {
      foods: (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        source: row.source as NutritionFood["source"],
        servingSizeG: Number(row.serving_size_g),
        caloriesKcal: Number(row.calories_kcal),
        carbsG: Number(row.carbs_g),
        proteinG: Number(row.protein_g),
        fatG: Number(row.fat_g),
        isCustom: row.is_custom,
      })),
    },
  };
}

export async function saveNutritionFoodAction(input: {
  name: string;
  source?: NutritionFood["source"];
  servingSizeG: number;
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
}): Promise<ActionResult<{ food: NutritionFood }>> {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { data, error } = await db
    .from("nutrition_foods")
    .insert({
      name: input.name.trim(),
      source: input.source ?? "custom",
      serving_size_g: input.servingSizeG,
      calories_kcal: input.caloriesKcal,
      carbs_g: input.carbsG,
      protein_g: input.proteinG,
      fat_g: input.fatG,
      created_by: session.id,
      is_custom: true,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível cadastrar o alimento." };
  }

  return {
    success: true,
    data: {
      food: {
        id: data.id,
        name: data.name,
        source: data.source as NutritionFood["source"],
        servingSizeG: Number(data.serving_size_g),
        caloriesKcal: Number(data.calories_kcal),
        carbsG: Number(data.carbs_g),
        proteinG: Number(data.protein_g),
        fatG: Number(data.fat_g),
        isCustom: data.is_custom,
      },
    },
  };
}

// ─── Planos alimentares ───────────────────────────────────────────────────

export async function listNutritionMealPlansAction(input: {
  patientId?: string;
  templatesOnly?: boolean;
}): Promise<ActionResult<{ plans: NutritionMealPlanRecord[] }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  let query = db
    .from("patient_nutrition_meal_plans")
    .select("*")
    .order("updated_at", { ascending: false });

  if (input.templatesOnly) {
    query = query.eq("is_template", true);
  } else if (input.patientId) {
    query = query.eq("patient_id", input.patientId).eq("is_template", false);
  }

  const { data, error } = await query;
  if (error) {
    return { success: false, error: "Não foi possível carregar planos." };
  }

  return {
    success: true,
    data: {
      plans: (data ?? []).map((row: any) => ({
        id: row.id,
        patientId: row.patient_id,
        professionalId: row.professional_id,
        title: row.title,
        meals: row.meals as MealPlanMeal[],
        macros: row.macros as MealPlanMacros,
        notes: row.notes,
        isTemplate: row.is_template,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    },
  };
}

export async function saveNutritionMealPlanAction(input: {
  id?: string;
  patientId?: string | null;
  title: string;
  meals: MealPlanMeal[];
  macros: MealPlanMacros;
  notes?: string;
  isTemplate?: boolean;
}): Promise<ActionResult<{ plan: NutritionMealPlanRecord }>> {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  if (input.patientId) {
    const access = await assertPatientAccess(input.patientId, session);
    if (!access.ok) return { success: false, error: access.error };
  }

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const payload = {
    patient_id: input.patientId ?? null,
    professional_id: session.id,
    title: input.title.trim(),
    meals: input.meals,
    macros: input.macros,
    notes: input.notes?.trim() || null,
    is_template: input.isTemplate ?? false,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? db.from("patient_nutrition_meal_plans").update(payload).eq("id", input.id).select("*").single()
    : db.from("patient_nutrition_meal_plans").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) {
    return { success: false, error: "Não foi possível salvar o plano alimentar." };
  }

  if (input.patientId) revalidateNutritionPaths(input.patientId);
  return {
    success: true,
    data: {
      plan: {
        id: data.id,
        patientId: data.patient_id,
        professionalId: data.professional_id,
        title: data.title,
        meals: data.meals as MealPlanMeal[],
        macros: data.macros as MealPlanMacros,
        notes: data.notes,
        isTemplate: data.is_template,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
  };
}

export async function deleteNutritionMealPlanAction(
  id: string,
  patientId?: string
): Promise<ActionResult<null>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const { error } = await db.from("patient_nutrition_meal_plans").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Não foi possível excluir o plano." };
  }

  if (patientId) revalidateNutritionPaths(patientId);
  return { success: true, data: null };
}

// ─── Templates e documentos ─────────────────────────────────────────────────

async function listTemplates(table: string): Promise<NutritionTemplateRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const { data } = await db.from(table).select("*").order("title");
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    conditionTag: row.condition_tag,
    content: row.content ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function listNutritionOrientationTemplatesAction(): Promise<
  ActionResult<{ templates: NutritionTemplateRecord[] }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  return {
    success: true,
    data: { templates: await listTemplates("nutrition_orientation_templates") },
  };
}

export async function listNutritionPrescriptionTemplatesAction(): Promise<
  ActionResult<{ templates: NutritionTemplateRecord[] }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  return {
    success: true,
    data: { templates: await listTemplates("nutrition_prescription_templates") },
  };
}

export async function saveNutritionTemplateAction(input: {
  kind: "orientation" | "prescription";
  id?: string;
  title: string;
  conditionTag?: string;
  content: string;
}): Promise<ActionResult<{ template: NutritionTemplateRecord }>> {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);
  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const table =
    input.kind === "orientation"
      ? "nutrition_orientation_templates"
      : "nutrition_prescription_templates";

  const payload = {
    title: input.title.trim(),
    condition_tag: input.conditionTag?.trim() || null,
    content: input.content.trim(),
    updated_at: new Date().toISOString(),
    ...(input.id ? {} : { created_by: session.id }),
  };

  const query = input.id
    ? db.from(table).update(payload).eq("id", input.id).select("*").single()
    : db.from(table).insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) {
    return { success: false, error: "Não foi possível salvar o modelo." };
  }

  return {
    success: true,
    data: {
      template: {
        id: data.id,
        title: data.title,
        conditionTag: data.condition_tag,
        content: data.content ?? "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    },
  };
}

async function listPatientDocuments(
  table: string,
  patientId: string
): Promise<PatientNutritionDocumentRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const { data } = await db
    .from(table)
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    title: row.title,
    content: row.content ?? "",
    templateId: row.template_id,
    createdAt: row.created_at,
  }));
}

export async function listPatientNutritionOrientationsAction(
  patientId: string
): Promise<ActionResult<{ records: PatientNutritionDocumentRecord[] }>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };
  return {
    success: true,
    data: { records: await listPatientDocuments("patient_nutrition_orientations", patientId) },
  };
}

export async function listPatientNutritionPrescriptionsAction(
  patientId: string
): Promise<ActionResult<{ records: PatientNutritionDocumentRecord[] }>> {
  const access = await requirePatientAccess(patientId);
  if (!access.ok) return { success: false, error: access.error };
  return {
    success: true,
    data: { records: await listPatientDocuments("patient_nutrition_prescriptions", patientId) },
  };
}

export async function savePatientNutritionDocumentAction(input: {
  kind: "orientation" | "prescription";
  patientId: string;
  title: string;
  content: string;
  templateId?: string;
}): Promise<ActionResult<{ record: PatientNutritionDocumentRecord }>> {
  const access = await requirePatientAccess(input.patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const table =
    input.kind === "orientation"
      ? "patient_nutrition_orientations"
      : "patient_nutrition_prescriptions";

  const { data, error } = await db
    .from(table)
    .insert({
      patient_id: input.patientId,
      professional_id: access.session.id,
      title: input.title.trim(),
      content: input.content.trim(),
      template_id: input.templateId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível salvar o documento." };
  }

  revalidateNutritionPaths(input.patientId);
  return {
    success: true,
    data: {
      record: {
        id: data.id,
        patientId: data.patient_id,
        professionalId: data.professional_id,
        title: data.title,
        content: data.content ?? "",
        templateId: data.template_id,
        createdAt: data.created_at,
      },
    },
  };
}

export async function deletePatientNutritionDocumentAction(input: {
  kind: "orientation" | "prescription";
  patientId: string;
  id: string;
}): Promise<ActionResult<null>> {
  const access = await requirePatientAccess(input.patientId);
  if (!access.ok) return { success: false, error: access.error };

  const db = await getDb();
  if (!db) return { success: false, error: "Falha na conexão." };

  const table =
    input.kind === "orientation"
      ? "patient_nutrition_orientations"
      : "patient_nutrition_prescriptions";

  const { error } = await db.from(table).delete().eq("id", input.id);
  if (error) {
    return { success: false, error: "Não foi possível excluir o documento." };
  }

  revalidateNutritionPaths(input.patientId);
  return { success: true, data: null };
}
