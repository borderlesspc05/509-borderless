"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { ClipboardList, Loader2, Plus, Save, Trash2 } from "lucide-react";

import {
  deleteNutritionAnamnesisAction,
  listNutritionAnamnesisAction,
  saveNutritionAnamnesisAction,
} from "@/app/actions/nutrition-actions";
import {
  NutritionFormFooter,
  NutritionHistoryItem,
  NutritionPromptChips,
  NutritionSectionCard,
  nutritionInputClassName,
  nutritionTextareaClassName,
} from "@/components/nutrition/nutrition-ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPatientDate, formatPatientDateTime } from "@/lib/patient-format";
import type { NutritionAnamnesisRecord } from "@/lib/nutrition/types";

const ANAMNESIS_PROMPTS = [
  "Queixa principal e objetivo nutricional",
  "Histórico clínico e medicamentos em uso",
  "Alergias, intolerâncias e restrições alimentares",
  "Recordatório alimentar e rotina de refeições",
  "Atividade física, sono e hábitos de vida",
];

type NutritionAnamnesisSectionProps = {
  patientId: string;
  readOnly?: boolean;
};

export function NutritionAnamnesisSection({
  patientId,
  readOnly = false,
}: NutritionAnamnesisSectionProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [records, setRecords] = useState<NutritionAnamnesisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    const result = await listNutritionAnamnesisAction(patientId);
    if (result.success && result.data) {
      setRecords(result.data.records);
    }
    setIsLoading(false);
  }, [patientId]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  function appendPrompt(prompt: string) {
    setContent((current) => {
      const header = `## ${prompt}\n`;
      return current.includes(header)
        ? current
        : `${current}${current ? "\n\n" : ""}${header}`;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveNutritionAnamnesisAction({
        patientId,
        id: editingId ?? undefined,
        consultationDate,
        content,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Anamnese salva" });
      setContent("");
      setEditingId(null);
      void loadRecords();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNutritionAnamnesisAction(patientId, id);
      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }
      toast.success({ title: "Anamnese removida" });
      void loadRecords();
    });
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <NutritionSectionCard
          icon={ClipboardList}
          title="Anamnese nutricional"
          description="Registro livre por consulta: queixas, condições clínicas, preferências, restrições, medicamentos e histórico de saúde."
        >
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="anamnesis-date" className="text-sm font-medium text-muted-foreground">
                Data da consulta
              </Label>
              <Input
                id="anamnesis-date"
                type="date"
                className={nutritionInputClassName}
                value={consultationDate}
                onChange={(event) => setConsultationDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Tópicos sugeridos
              </Label>
              <NutritionPromptChips prompts={ANAMNESIS_PROMPTS} onSelect={appendPrompt} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="anamnesis-content" className="text-sm font-medium text-muted-foreground">
              Conteúdo da anamnese
            </Label>
            <textarea
              id="anamnesis-content"
              rows={10}
              className={nutritionTextareaClassName}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Descreva a anamnese nutricional da consulta. Use os tópicos sugeridos acima como guia ou escreva livremente."
            />
          </div>

          <NutritionFormFooter
            hint={
              editingId
                ? "Editando registro existente — salvar substitui o conteúdo anterior."
                : "O histórico fica disponível abaixo após salvar."
            }
          >
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setContent("");
                }}
              >
                Cancelar edição
              </Button>
            ) : null}
            <Button type="button" disabled={isPending} onClick={handleSave} className="gap-2">
              <Save className="size-4" />
              {isPending ? "Salvando..." : editingId ? "Atualizar anamnese" : "Salvar anamnese"}
            </Button>
          </NutritionFormFooter>
        </NutritionSectionCard>
      ) : null}

      <NutritionSectionCard title="Histórico de anamneses">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando...
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Nenhuma anamnese registrada"
            description="As anamneses nutricionais aparecerão aqui após o primeiro registro."
          />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <NutritionHistoryItem
                key={record.id}
                title={`Consulta de ${formatPatientDate(record.consultationDate)}`}
                subtitle={`Atualizado em ${formatPatientDateTime(record.updatedAt)}`}
                actions={
                  !readOnly ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(record.id);
                          setConsultationDate(record.consultationDate);
                          setContent(record.content);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  ) : undefined
                }
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {record.content || "—"}
                </p>
              </NutritionHistoryItem>
            ))}
          </div>
        )}
      </NutritionSectionCard>
    </div>
  );
}
