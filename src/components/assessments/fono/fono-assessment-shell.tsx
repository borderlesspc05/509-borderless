"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { saveFonoEvaluationAction } from "@/app/actions/fono-assessment-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { ASSESSMENT_APPLY_HUB_HREF } from "@/lib/assessment-apply-routes";
import { toDateKey } from "@/lib/calendar-utils";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";

type FonoAssessmentShellProps = {
  title: string;
  description: string;
  instrument: string;
  patients: ClinicalPatient[];
  children: (helpers: {
    disabled: boolean;
  }) => React.ReactNode;
  getFilledCount: () => number;
  getFormData: () => Record<string, unknown>;
  getTotalScore?: () => number | null;
};

export function FonoAssessmentShell({
  title,
  description,
  instrument,
  patients,
  children,
  getFilledCount,
  getFormData,
  getTotalScore,
}: FonoAssessmentShellProps) {
  const toast = useAppToast();
  const { userName, displayRole } = useUserRole();
  const [isPending, startTransition] = useTransition();
  const [patientId, setPatientId] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(toDateKey(new Date()));

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId) ?? null,
    [patientId, patients]
  );

  const save = (status: "draft" | "finalized") => {
    if (!selectedPatient) {
      toast.error({ title: "Selecione o paciente" });
      return;
    }

    const filledCount = getFilledCount();
    if (filledCount <= 0) {
      toast.error({
        title: "Formulário vazio",
        description: "Preencha ao menos um campo antes de salvar.",
      });
      return;
    }

    startTransition(async () => {
      const result = await saveFonoEvaluationAction({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        evaluationDate,
        instrument,
        formData: getFormData(),
        filledCount,
        professionalName: userName || "Profissional",
        professionalRole: displayRole || "Fonoaudiólogo",
        status,
        totalScore: getTotalScore?.() ?? null,
      });

      if (!result.success) {
        toast.error({
          title: "Erro ao salvar",
          description: result.error ?? "Tente novamente.",
        });
        return;
      }

      toast.success({
        title: status === "finalized" ? "Avaliação finalizada" : "Rascunho salvo",
        description:
          status === "finalized"
            ? `${instrument} registrada no prontuário.`
            : `Rascunho de ${instrument} salvo.`,
      });
    });
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={title}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Evolução" },
          { label: "Avaliações", href: ASSESSMENT_APPLY_HUB_HREF },
          { label: title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={ASSESSMENT_APPLY_HUB_HREF} />}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <section className="grid gap-4 rounded-xl border border-border/80 bg-card p-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Paciente</Label>
          <Select value={patientId} onValueChange={(value) => value && setPatientId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fono-eval-date">Data da avaliação</Label>
          <Input
            id="fono-eval-date"
            type="date"
            value={evaluationDate}
            onChange={(event) => setEvaluationDate(event.target.value)}
          />
        </div>
      </section>

      {children({ disabled: isPending })}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="gap-2"
          onClick={() => save("draft")}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Salvar rascunho
        </Button>
        <Button
          type="button"
          disabled={isPending}
          className="gap-2"
          onClick={() => save("finalized")}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Finalizar avaliação
        </Button>
      </div>
    </PageContainer>
  );
}
