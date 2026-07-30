"use server";

import { redirect } from "next/navigation";

import { getAnamnesisListAction } from "@/app/actions/anamnesis-actions";
import {
  getPatientRecordAction,
  listPatientsAction,
  type PatientRecordData,
} from "@/app/actions/patient-record-actions";
import { getTherapeuticPlanAction } from "@/app/actions/therapeutic-plan-actions";
import { requirePermission } from "@/lib/auth-guard";
import { getAccessDeniedRedirectPath, PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AnamnesisRecord } from "@/app/actions/anamnesis-actions";
import type { TherapeuticPlanRecord } from "@/app/actions/therapeutic-plan-actions";
import type { PatientRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function requireMasterSession() {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  if (!session.isMaster) {
    redirect(getAccessDeniedRedirectPath(session.profile));
  }

  return session;
}

export type MasterProntuarioData = {
  record: PatientRecordData;
  anamneses: AnamnesisRecord[];
  therapeuticPlan: TherapeuticPlanRecord | null;
  bodyMarksCount: number;
};

export async function listPatientsForMasterProntuarioAction(): Promise<
  ActionResult<{ patients: PatientRow[] }>
> {
  await requireMasterSession();
  return listPatientsAction();
}

export async function getMasterProntuarioAction(
  patientId: string
): Promise<ActionResult<MasterProntuarioData>> {
  await requireMasterSession();

  const [recordResult, anamneses, planResult, supabase] = await Promise.all([
    getPatientRecordAction(patientId),
    getAnamnesisListAction(patientId),
    getTherapeuticPlanAction(patientId),
    createServerSupabaseClient(),
  ]);

  if (!recordResult.success || !recordResult.data) {
    return {
      success: false,
      error: recordResult.error ?? "Não foi possível carregar o prontuário.",
    };
  }

  let bodyMarksCount = 0;
  if (supabase) {
    const { count } = await supabase
      .from("patient_body_marks")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("is_active", true);
    bodyMarksCount = count ?? 0;
  }

  return {
    success: true,
    data: {
      record: recordResult.data,
      anamneses,
      therapeuticPlan: planResult.success
        ? (planResult.data?.plan ?? null)
        : null,
      bodyMarksCount,
    },
  };
}

export async function sendMasterProntuarioToFamilyAction(input: {
  patientId: string;
  summaryHtml: string;
}): Promise<ActionResult<{ orientationId: string }>> {
  const session = await requireMasterSession();

  const title = `Prontuário consolidado — ${new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date())}`;

  const contentHtml = input.summaryHtml.trim();
  if (!contentHtml) {
    return { success: false, error: "Resumo vazio para envio." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("parent_orientations")
    .insert({
      patient_id: input.patientId,
      title,
      content_html: contentHtml,
      author_name: session.fullName,
      author_user_id: session.id,
      is_published: true,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Não foi possível enviar à família.",
    };
  }

  return { success: true, data: { orientationId: data.id } };
}
