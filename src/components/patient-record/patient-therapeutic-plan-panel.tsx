"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Target, Loader2, Save } from "lucide-react";

import {
  getTherapeuticPlanAction,
  saveTherapeuticPlanAction,
} from "@/app/actions/therapeutic-plan-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPatientDateTime } from "@/lib/patient-format";

type PatientTherapeuticPlanPanelProps = {
  patientId: string;
  readOnly?: boolean;
};

export function PatientTherapeuticPlanPanel({
  patientId,
  readOnly = false,
}: PatientTherapeuticPlanPanelProps) {
  const toast = useAppToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [shortTermGoals, setShortTermGoals] = useState("");
  const [mediumTermGoals, setMediumTermGoals] = useState("");
  const [longTermGoals, setLongTermGoals] = useState("");
  const [notes, setNotes] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    const result = await getTherapeuticPlanAction(patientId);

    if (!result.success) {
      toast.error({
        title: "Erro",
        description:
          result.error ?? "Não foi possível carregar o planejamento.",
      });
      setIsLoading(false);
      return;
    }

    const plan = result.data?.plan ?? null;
    setShortTermGoals(plan?.shortTermGoals ?? "");
    setMediumTermGoals(plan?.mediumTermGoals ?? "");
    setLongTermGoals(plan?.longTermGoals ?? "");
    setNotes(plan?.notes ?? "");
    setUpdatedAt(plan?.updatedAt ?? null);
    setIsLoading(false);
  }, [patientId]);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  function handleSave() {
    startTransition(async () => {
      const result = await saveTherapeuticPlanAction({
        patientId,
        shortTermGoals,
        mediumTermGoals,
        longTermGoals,
        notes,
      });

      if (!result.success) {
        toast.error({
          title: "Erro",
          description:
            result.error ?? "Não foi possível salvar o planejamento.",
        });
        return;
      }

      setUpdatedAt(result.data?.plan.updatedAt ?? null);
      toast.success({
        title: "Planejamento salvo",
        description:
          "Os objetivos terapêuticos ficaram disponíveis para a equipe.",
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          Planejamento terapêutico
        </CardTitle>
        <CardDescription>
          Objetivos de curto, médio e longo prazo para continuidade do
          acompanhamento pela equipe multidisciplinar.
          {updatedAt ? (
            <>
              {" "}
              Última atualização: {formatPatientDateTime(updatedAt)}.
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando planejamento...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="short-term-goals">Objetivos de curto prazo</Label>
              <Textarea
                id="short-term-goals"
                value={shortTermGoals}
                onChange={(event) => setShortTermGoals(event.target.value)}
                readOnly={readOnly}
                rows={4}
                placeholder="Metas para as próximas semanas / sessões..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium-term-goals">
                Objetivos de médio prazo
              </Label>
              <Textarea
                id="medium-term-goals"
                value={mediumTermGoals}
                onChange={(event) => setMediumTermGoals(event.target.value)}
                readOnly={readOnly}
                rows={4}
                placeholder="Metas intermediárias do plano terapêutico..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-term-goals">Objetivos de longo prazo</Label>
              <Textarea
                id="long-term-goals"
                value={longTermGoals}
                onChange={(event) => setLongTermGoals(event.target.value)}
                readOnly={readOnly}
                rows={4}
                placeholder="Metas de continuidade e desfecho esperado..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-notes">Observações gerais</Label>
              <Textarea
                id="plan-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                readOnly={readOnly}
                rows={3}
                placeholder="Cuidados, restrições ou alinhamentos para a equipe..."
              />
            </div>

            {!readOnly ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={isPending}
                  className="gap-2"
                  onClick={handleSave}
                >
                  <Save className="size-4" />
                  {isPending ? "Salvando..." : "Salvar planejamento"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
