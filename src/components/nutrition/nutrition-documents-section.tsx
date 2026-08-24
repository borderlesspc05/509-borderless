"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Eye, FileDown, FileText, Pill, Plus, Save, Trash2 } from "lucide-react";

import {
  deletePatientNutritionDocumentAction,
  listNutritionOrientationTemplatesAction,
  listNutritionPrescriptionTemplatesAction,
  listPatientNutritionOrientationsAction,
  listPatientNutritionPrescriptionsAction,
  saveNutritionTemplateAction,
  savePatientNutritionDocumentAction,
} from "@/app/actions/nutrition-actions";
import {
  NutritionFormFooter,
  NutritionHistoryItem,
  NutritionSectionCard,
  NutritionTemplatePicker,
  nutritionInputClassName,
  nutritionTextareaClassName,
} from "@/components/nutrition/nutrition-ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateNutritionPdf } from "@/lib/nutrition-pdf";
import type {
  NutritionTemplateRecord,
  PatientNutritionDocumentRecord,
} from "@/lib/nutrition/types";
import { formatPatientDateTime } from "@/lib/patient-format";

type NutritionDocumentsSectionProps = {
  kind: "orientation" | "prescription";
  patientId: string;
  patientName: string;
  professionalName: string;
  professionalRole: string;
  readOnly?: boolean;
};

export function NutritionDocumentsSection({
  kind,
  patientId,
  patientName,
  professionalName,
  professionalRole,
  readOnly = false,
}: NutritionDocumentsSectionProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [templates, setTemplates] = useState<NutritionTemplateRecord[]>([]);
  const [records, setRecords] = useState<PatientNutritionDocumentRecord[]>([]);
  const [title, setTitle] = useState("");
  const [conditionTag, setConditionTag] = useState("");
  const [content, setContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);

  const isOrientation = kind === "orientation";
  const sectionTitle = isOrientation
    ? "Orientações nutricionais"
    : "Prescrição de manipulados";
  const sectionDescription = isOrientation
    ? "Biblioteca por condição clínica, encaminhamento em PDF e novas orientações em campo livre."
    : "Busca rápida por prescrições cadastradas, PDF para o paciente e inclusão de novas prescrições.";
  const SectionIcon = isOrientation ? FileText : Pill;

  const loadData = useCallback(async () => {
    const [templatesResult, recordsResult] = await Promise.all([
      isOrientation
        ? listNutritionOrientationTemplatesAction()
        : listNutritionPrescriptionTemplatesAction(),
      isOrientation
        ? listPatientNutritionOrientationsAction(patientId)
        : listPatientNutritionPrescriptionsAction(patientId),
    ]);

    if (templatesResult.success && templatesResult.data) {
      setTemplates(templatesResult.data.templates);
    }
    if (recordsResult.success && recordsResult.data) {
      setRecords(recordsResult.data.records);
    }
  }, [isOrientation, patientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function applyTemplate(template: NutritionTemplateRecord) {
    setTitle(template.title);
    setConditionTag(template.conditionTag ?? "");
    setContent(template.content);
  }

  function handleSaveTemplate() {
    startTransition(async () => {
      const result = await saveNutritionTemplateAction({
        kind,
        title,
        conditionTag,
        content,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Modelo salvo na biblioteca" });
      void loadData();
    });
  }

  function handleAssignToPatient() {
    startTransition(async () => {
      const result = await savePatientNutritionDocumentAction({
        kind,
        patientId,
        title,
        content,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Documento vinculado ao paciente" });
      setTitle("");
      setContent("");
      setConditionTag("");
      void loadData();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePatientNutritionDocumentAction({
        kind,
        patientId,
        id,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Documento removido" });
      void loadData();
    });
  }

  async function handleExportPdf(record: PatientNutritionDocumentRecord) {
    try {
      await generateNutritionPdf({
        patientName,
        title: record.title,
        contentHtml: record.content.replace(/\n/g, "<br />"),
        professionalName,
        professionalRole,
      });
    } catch {
      toast.error({ title: "Erro", description: "Não foi possível gerar o PDF." });
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <NutritionSectionCard
          icon={SectionIcon}
          title={sectionTitle}
          description={sectionDescription}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setPreviewOpen((current) => !current)}
            >
              <Eye className="size-3.5" />
              {previewOpen ? "Ocultar prévia" : "Mostrar prévia"}
            </Button>
          }
        >
          {templates.length > 0 ? (
            <NutritionTemplatePicker
              templates={templates}
              onSelect={(id) => {
                const template = templates.find((item) => item.id === id);
                if (template) applyTemplate(template);
              }}
            />
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor={`${kind}-title`}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Título do documento
                  </Label>
                  <Input
                    id={`${kind}-title`}
                    className={nutritionInputClassName}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={
                      isOrientation
                        ? "Ex.: Orientações para diabetes tipo 2"
                        : "Ex.: Prescrição — ômega 3 + vitamina D"
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label
                    htmlFor={`${kind}-condition`}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Condição clínica
                  </Label>
                  <Input
                    id={`${kind}-condition`}
                    className={nutritionInputClassName}
                    value={conditionTag}
                    onChange={(event) => setConditionTag(event.target.value)}
                    placeholder="Ex.: diabetes, gestação, dislipidemia..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor={`${kind}-content`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Conteúdo
                </Label>
                <textarea
                  id={`${kind}-content`}
                  rows={14}
                  className={nutritionTextareaClassName}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={
                    isOrientation
                      ? "Descreva as orientações nutricionais de forma clara para o paciente ou responsável..."
                      : "Liste fórmulas manipuladas, posologia, duração e observações..."
                  }
                />
              </div>
            </div>

            {previewOpen ? (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Prévia do documento
                </Label>
                <div className="min-h-[320px] flex-1 rounded-xl border border-border/70 bg-muted/10 p-5">
                  <div className="mb-4 space-y-1 border-b border-border/60 pb-4">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {patientName}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground">
                      {title || "Sem título"}
                    </h3>
                    {conditionTag ? (
                      <Badge variant="secondary" className="font-normal capitalize">
                        {conditionTag}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {content || "O conteúdo aparecerá aqui conforme você digita."}
                  </div>
                  <p className="mt-6 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    {professionalName} · {professionalRole}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <NutritionFormFooter hint="Salve na biblioteca para reutilizar ou encaminhe diretamente ao paciente.">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !title.trim() || !content.trim()}
              onClick={handleSaveTemplate}
              className="gap-2"
            >
              <Save className="size-4" />
              Salvar na biblioteca
            </Button>
            <Button
              type="button"
              disabled={isPending || !title.trim() || !content.trim()}
              onClick={handleAssignToPatient}
              className="gap-2"
            >
              <Plus className="size-4" />
              Encaminhar ao paciente
            </Button>
          </NutritionFormFooter>
        </NutritionSectionCard>
      ) : null}

      <NutritionSectionCard title="Documentos do paciente">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento registrado.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <NutritionHistoryItem
                key={record.id}
                title={record.title}
                subtitle={formatPatientDateTime(record.createdAt)}
                actions={
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => void handleExportPdf(record)}
                    >
                      <FileDown className="size-4" />
                      PDF
                    </Button>
                    {!readOnly ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </>
                }
              >
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {record.content}
                </p>
              </NutritionHistoryItem>
            ))}
          </div>
        )}
      </NutritionSectionCard>
    </div>
  );
}
