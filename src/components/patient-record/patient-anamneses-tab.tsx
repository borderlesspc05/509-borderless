"use client";

import { useEffect, useState } from "react";
import { ClipboardList, PlusCircle, FileText } from "lucide-react";

import { getAnamnesisListAction, type AnamnesisRecord } from "@/app/actions/anamnesis-actions";
import { AnamnesisFisioterapiaForm } from "@/components/clinical-reports/anamnesis-fisioterapia-form";
import { AnamnesisTerapiaOcupacionalForm } from "@/components/clinical-reports/anamnesis-terapia-ocupacional-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ALTERACAO_MUSCULOESQUELETICA_OPTIONS,
  COMPORTAMENTO_OPTIONS,
  COMPONENTES_MOTORES_OPTIONS,
  DESENVOLVIMENTO_MOTOR_OPTIONS,
  getAvdNivelLabel,
  getQualidadeLabel,
  type AnamnesisFisioterapiaFormData,
} from "@/lib/anamnesis-fisioterapia";
import { formatPatientDateTime } from "@/lib/patient-format";

const ANAMNESIS_TYPE_LABELS: Record<string, string> = {
  fisioterapia: "Fisioterapia",
  terapia_ocupacional: "Terapia Ocupacional",
};

function selectedLabels(
  values: Record<string, boolean> | undefined,
  options: readonly { key: string; label: string }[]
) {
  if (!values) return "—";
  const labels = options
    .filter((option) => values[option.key])
    .map((option) => option.label);
  return labels.length > 0 ? labels.join(", ") : "—";
}

function FisioterapiaSummary({ data }: { data: AnamnesisFisioterapiaFormData }) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">Queixa principal:</span>{" "}
        {data.diagnosticoQueixaPrincipal || "—"}
      </p>
      <p>
        <span className="font-medium text-foreground">Queixa funcional:</span>{" "}
        {data.queixaFuncional || "—"}
      </p>
      <p>
        <span className="font-medium text-foreground">Desenvolvimento:</span>{" "}
        {selectedLabels(data.desenvolvimento, DESENVOLVIMENTO_MOTOR_OPTIONS)}
      </p>
      <p>
        <span className="font-medium text-foreground">Musculoesquelético:</span>{" "}
        {selectedLabels(
          data.alteracaoMusculoEsqueletica,
          ALTERACAO_MUSCULOESQUELETICA_OPTIONS
        )}
      </p>
      <p>
        <span className="font-medium text-foreground">Componentes motores:</span>{" "}
        {selectedLabels(data.componentesMotores, COMPONENTES_MOTORES_OPTIONS)}
      </p>
      <p>
        <span className="font-medium text-foreground">Dominância:</span>{" "}
        {data.dominancia || "—"}
      </p>
      <p>
        <span className="font-medium text-foreground">Compreensão / imitação:</span>{" "}
        {getQualidadeLabel(data.compreensao || "")} /{" "}
        {getQualidadeLabel(data.imitacaoMotora || "")}
      </p>
      <p>
        <span className="font-medium text-foreground">Comportamento:</span>{" "}
        {selectedLabels(data.comportamento, COMPORTAMENTO_OPTIONS)}
      </p>
      <p>
        <span className="font-medium text-foreground">AVDs:</span> higiene{" "}
        {getAvdNivelLabel(data.avd?.higiene?.nivel || "")}, banho{" "}
        {getAvdNivelLabel(data.avd?.banho?.nivel || "")}, vestuário{" "}
        {getAvdNivelLabel(data.avd?.vestuario?.nivel || "")}, alimentação{" "}
        {getAvdNivelLabel(data.avd?.alimentacao?.nivel || "")}
      </p>
      <p>
        <span className="font-medium text-foreground">Objetivos da família:</span>{" "}
        {data.objetivosFamilia || "—"}
      </p>
      <p>
        <span className="font-medium text-foreground">Objetivos funcionais:</span>{" "}
        {data.objetivosFuncionais || "—"}
      </p>
    </div>
  );
}

export function PatientAnamnesesTab({ patientId }: { patientId: string }) {
  const [anamneses, setAnamneses] = useState<AnamnesisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("fisioterapia");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAnamneses = async () => {
    setIsLoading(true);
    const data = await getAnamnesisListAction(patientId);
    setAnamneses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadAnamneses();
  }, [patientId]);

  const handleSuccess = () => {
    setIsCreating(false);
    void loadAnamneses();
  };

  return (
    <div className="space-y-4">
      {isCreating ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Nova Anamnese</CardTitle>
                <CardDescription>Preencha os dados do formulário estruturado.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Voltar
              </Button>
            </div>
            <div className="mt-4 max-w-sm">
              <Select value={selectedType} onValueChange={(val) => { if (val) setSelectedType(val); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                  <SelectItem value="terapia_ocupacional">Terapia Ocupacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedType === "fisioterapia" && <AnamnesisFisioterapiaForm patientId={patientId} onSuccess={handleSuccess} />}
            {selectedType === "terapia_ocupacional" && <AnamnesisTerapiaOcupacionalForm patientId={patientId} onSuccess={handleSuccess} />}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  Anamneses Registradas
                </CardTitle>
                <CardDescription>Histórico de anamneses estruturadas do paciente.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setIsCreating(true)}>
                <PlusCircle className="size-4" /> Nova Anamnese
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Carregando...</div>
            ) : anamneses.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Nenhuma anamnese registrada"
                description="Ainda não há anamneses estruturadas para este paciente."
              />
            ) : (
              <div className="space-y-3">
                {anamneses.map((anamnese) => {
                  const isExpanded = expandedId === anamnese.id;
                  const typeLabel =
                    ANAMNESIS_TYPE_LABELS[anamnese.anamnesisType] ??
                    anamnese.anamnesisType.replace(/_/g, " ");

                  return (
                    <div
                      key={anamnese.id}
                      className="rounded-xl border border-border/80 bg-card p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            <FileText className="mr-2 inline size-4 text-primary" />
                            Anamnese de {typeLabel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Criado em {formatPatientDateTime(anamnese.createdAt)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : anamnese.id)
                          }
                        >
                          {isExpanded ? "Ocultar" : "Ver resumo"}
                        </Button>
                      </div>
                      {isExpanded ? (
                        <div className="mt-4 border-t border-border/60 pt-4">
                          {anamnese.anamnesisType === "fisioterapia" ? (
                            <FisioterapiaSummary
                              data={anamnese.formData as AnamnesisFisioterapiaFormData}
                            />
                          ) : (
                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                              {JSON.stringify(anamnese.formData, null, 2)}
                            </pre>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
