"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Ruler, Save, Trash2 } from "lucide-react";

import {
  deleteNutritionAnthropometryAction,
  listNutritionAnthropometryAction,
  saveNutritionAnthropometryAction,
} from "@/app/actions/nutrition-actions";
import { NutritionEvolutionCharts } from "@/components/nutrition/nutrition-evolution-charts";
import { NutritionNumberField } from "@/components/nutrition/nutrition-number-field";
import {
  NutritionFieldGroup,
  NutritionFormFooter,
  NutritionHistoryItem,
  NutritionSectionCard,
  NutritionStatCard,
  nutritionInputClassName,
} from "@/components/nutrition/nutrition-ui";
import { useAppToast } from "@/hooks/use-app-toast";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  calculateBmi,
  classifyAdultBmi,
  classifyBodyFat,
  emptyAdultAnthropometry,
  emptyChildAnthropometry,
  emptyPregnantAnthropometry,
  PREGNANCY_WEEKS,
} from "@/lib/nutrition/calculations";
import type {
  AdultAnthropometryData,
  AnthropometryRecordType,
  ChildAnthropometryData,
  NutritionAnthropometryRecord,
  PregnantAnthropometryData,
} from "@/lib/nutrition/types";
import { formatPatientDate } from "@/lib/patient-format";

const RECORD_TYPE_LABELS: Record<AnthropometryRecordType, string> = {
  adult: "Adulto/idoso",
  child: "Criança",
  pregnant: "Gestante",
};

const PREGNANCY_TRIMESTERS = [
  { label: "1º trimestre", weeks: PREGNANCY_WEEKS.filter((w) => w <= 13) },
  { label: "2º trimestre", weeks: PREGNANCY_WEEKS.filter((w) => w >= 14 && w <= 27) },
  { label: "3º trimestre", weeks: PREGNANCY_WEEKS.filter((w) => w >= 28) },
];

type NutritionAnthropometrySectionProps = {
  patientId: string;
  patientBirthDate?: string | null;
  readOnly?: boolean;
};

export function NutritionAnthropometrySection({
  patientId,
  readOnly = false,
}: NutritionAnthropometrySectionProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [records, setRecords] = useState<NutritionAnthropometryRecord[]>([]);
  const [recordType, setRecordType] = useState<AnthropometryRecordType>("adult");
  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adultData, setAdultData] = useState<AdultAnthropometryData>(
    emptyAdultAnthropometry()
  );
  const [childData, setChildData] = useState<ChildAnthropometryData>(
    emptyChildAnthropometry()
  );
  const [pregnantData, setPregnantData] = useState<PregnantAnthropometryData>(
    emptyPregnantAnthropometry()
  );

  const loadRecords = useCallback(async () => {
    const result = await listNutritionAnthropometryAction(patientId);
    if (result.success && result.data) {
      setRecords(result.data.records);
    }
  }, [patientId]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const adultBmiLabel = useMemo(() => {
    if (!adultData.bmi) return "";
    return classifyAdultBmi(adultData.bmi);
  }, [adultData.bmi]);

  function updateAdultWeightHeight(weightKg: number | null, heightCm: number | null) {
    setAdultData((current) => {
      const bmi = weightKg && heightCm ? calculateBmi(weightKg, heightCm) : null;
      return { ...current, weightKg, heightCm, bmi };
    });
  }

  function updateChildMetrics(partial: Partial<ChildAnthropometryData>) {
    setChildData((current) => {
      const next = { ...current, ...partial };
      if (next.weightKg && next.heightCm) {
        next.bmi = calculateBmi(next.weightKg, next.heightCm);
      }
      return next;
    });
  }

  function handleSave() {
    const formData =
      recordType === "adult"
        ? adultData
        : recordType === "child"
          ? childData
          : pregnantData;

    startTransition(async () => {
      const result = await saveNutritionAnthropometryAction({
        patientId,
        id: editingId ?? undefined,
        recordType,
        consultationDate,
        formData,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Antropometria salva" });
      setEditingId(null);
      setAdultData(emptyAdultAnthropometry());
      setChildData(emptyChildAnthropometry());
      setPregnantData(emptyPregnantAnthropometry());
      void loadRecords();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNutritionAnthropometryAction(patientId, id);
      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }
      toast.success({ title: "Registro removido" });
      void loadRecords();
    });
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <NutritionSectionCard
          icon={Ruler}
          title="Registro antropométrico"
          description="Adultos/idosos, crianças ou gestantes — com evolução longitudinal entre consultas."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Tipo de registro
              </Label>
              <Select
                value={recordType}
                onValueChange={(value) =>
                  setRecordType(value as AnthropometryRecordType)
                }
              >
                <SelectTrigger className={nutritionInputClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adultos e idosos</SelectItem>
                  <SelectItem value="child">Crianças</SelectItem>
                  <SelectItem value="pregnant">Gestantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="anthro-date" className="text-sm font-medium text-muted-foreground">
                Data da consulta
              </Label>
              <Input
                id="anthro-date"
                type="date"
                className={nutritionInputClassName}
                value={consultationDate}
                onChange={(event) => setConsultationDate(event.target.value)}
              />
            </div>
          </div>

          <Tabs value={recordType}>
            <TabsContent value="adult" className="mt-0 space-y-4">
              <NutritionFieldGroup title="Análises básicas" columns={3}>
                <NutritionNumberField
                  id="adult-weight"
                  label="Peso atual"
                  unit="kg"
                  value={adultData.weightKg}
                  onChange={(value) =>
                    updateAdultWeightHeight(value, adultData.heightCm)
                  }
                />
                <NutritionNumberField
                  id="adult-height"
                  label="Altura atual"
                  unit="cm"
                  value={adultData.heightCm}
                  onChange={(value) =>
                    updateAdultWeightHeight(adultData.weightKg, value)
                  }
                />
                <NutritionStatCard
                  label="IMC (kg/m²)"
                  value={adultData.bmi ?? "—"}
                  hint={adultBmiLabel || undefined}
                  accent={Boolean(adultData.bmi)}
                />
              </NutritionFieldGroup>

              <NutritionFieldGroup
                title="Bioimpedância"
                description="Composição corporal e índices derivados."
                columns={3}
              >
                {(
                  [
                    ["fatPercent", "% gordura"],
                    ["musclePercent", "% massa muscular"],
                    ["muscleMassKg", "Massa muscular"],
                    ["totalBodyWaterKg", "Água corporal total"],
                    ["boneMassKg", "Massa óssea"],
                    ["fatMassKg", "Massa de gordura"],
                    ["leanMassKg", "Massa livre de gordura"],
                    ["visceralFatIndex", "Gordura visceral"],
                    ["metabolicAge", "Idade metabólica"],
                  ] as const
                ).map(([key, label]) => (
                  <NutritionNumberField
                    key={key}
                    id={`bio-${key}`}
                    label={label}
                    unit={key.includes("Percent") ? "%" : key === "metabolicAge" ? "anos" : "kg"}
                    value={adultData.bioimpedance[key]}
                    onChange={(value) =>
                      setAdultData((current) => ({
                        ...current,
                        bioimpedance: {
                          ...current.bioimpedance,
                          [key]: value,
                          ...(key === "fatPercent" && value
                            ? {
                                fatClassification: classifyBodyFat(value, "female"),
                              }
                            : {}),
                        },
                      }))
                    }
                  />
                ))}
              </NutritionFieldGroup>

              <NutritionFieldGroup
                title="Medidas antropométricas"
                description="Circunferências e perímetros em centímetros."
                columns={3}
              >
                {(
                  [
                    ["chestCm", "Tórax"],
                    ["abdomenCm", "Abdômen"],
                    ["waistCm", "Cintura"],
                    ["hipCm", "Quadril"],
                    ["leftArmRelaxedCm", "Braço esq. relaxado"],
                    ["leftArmContractedCm", "Braço esq. contraído"],
                    ["rightArmRelaxedCm", "Braço dir. relaxado"],
                    ["rightArmContractedCm", "Braço dir. contraído"],
                  ] as const
                ).map(([key, label]) => (
                  <NutritionNumberField
                    key={key}
                    id={`measure-${key}`}
                    label={label}
                    unit="cm"
                    value={adultData.measurements[key]}
                    onChange={(value) =>
                      setAdultData((current) => ({
                        ...current,
                        measurements: { ...current.measurements, [key]: value },
                      }))
                    }
                  />
                ))}
              </NutritionFieldGroup>
            </TabsContent>

            <TabsContent value="child" className="mt-0 space-y-4">
              <NutritionFieldGroup title="Dados da criança" columns={3}>
                <NutritionNumberField
                  id="child-age-months"
                  label="Idade"
                  unit="meses"
                  value={childData.ageMonths}
                  onChange={(value) => updateChildMetrics({ ageMonths: value })}
                />
                <NutritionNumberField
                  id="child-weight"
                  label="Peso atual"
                  unit="kg"
                  value={childData.weightKg}
                  onChange={(value) => updateChildMetrics({ weightKg: value })}
                />
                <NutritionNumberField
                  id="child-height"
                  label="Altura/comprimento"
                  unit="cm"
                  value={childData.heightCm}
                  onChange={(value) => updateChildMetrics({ heightCm: value })}
                />
                <NutritionStatCard
                  label="IMC (kg/m²)"
                  value={childData.bmi ?? "—"}
                  accent={Boolean(childData.bmi)}
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sexo</Label>
                  <Select
                    value={childData.sex}
                    onValueChange={(value) =>
                      updateChildMetrics({ sex: value as "male" | "female" })
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Menino</SelectItem>
                      <SelectItem value="female">Menina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </NutritionFieldGroup>

              <NutritionFieldGroup
                title="Classificações (curvas de crescimento)"
                description="Preencha conforme referência utilizada (OMS, SISVAN, etc.)."
                columns={3}
              >
                {(
                  [
                    ["weightAgeClassification", "Peso/idade"],
                    ["heightAgeClassification", "Altura/idade"],
                    ["bmiAgeClassification", "IMC/idade"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {label}
                    </Label>
                    <Input
                      className={nutritionInputClassName}
                      value={childData[key]}
                      onChange={(event) =>
                        updateChildMetrics({ [key]: event.target.value })
                      }
                      placeholder="Ex.: adequado, risco..."
                    />
                  </div>
                ))}
              </NutritionFieldGroup>
            </TabsContent>

            <TabsContent value="pregnant" className="mt-0 space-y-4">
              <NutritionFieldGroup title="Dados gestacionais" columns={3}>
                <NutritionNumberField
                  id="pregnant-height"
                  label="Altura"
                  unit="cm"
                  value={pregnantData.heightCm}
                  onChange={(value) =>
                    setPregnantData((current) => ({ ...current, heightCm: value }))
                  }
                />
                <NutritionNumberField
                  id="pregnant-pre-weight"
                  label="Peso pré-gestacional"
                  unit="kg"
                  value={pregnantData.prePregnancyWeightKg}
                  onChange={(value) =>
                    setPregnantData((current) => ({
                      ...current,
                      prePregnancyWeightKg: value,
                    }))
                  }
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Estado nutricional
                  </Label>
                  <Select
                    value={pregnantData.nutritionalStatus}
                    onValueChange={(value) =>
                      setPregnantData((current) => ({
                        ...current,
                        nutritionalStatus: value as PregnantAnthropometryData["nutritionalStatus"],
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="underweight">Baixo peso</SelectItem>
                      <SelectItem value="normal">Eutrofia</SelectItem>
                      <SelectItem value="overweight">Sobrepeso</SelectItem>
                      <SelectItem value="obese">Obesidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </NutritionFieldGroup>

              {PREGNANCY_TRIMESTERS.map((trimester) => (
                <NutritionFieldGroup
                  key={trimester.label}
                  title={`Peso por semana — ${trimester.label}`}
                  columns={4}
                >
                  {trimester.weeks.map((week) => (
                    <NutritionNumberField
                      key={week}
                      id={`week-${week}`}
                      label={`Sem. ${week}`}
                      unit="kg"
                      value={pregnantData.weeklyWeights[String(week)] ?? null}
                      onChange={(value) =>
                        setPregnantData((current) => ({
                          ...current,
                          weeklyWeights: {
                            ...current.weeklyWeights,
                            [String(week)]: value,
                          },
                        }))
                      }
                    />
                  ))}
                </NutritionFieldGroup>
              ))}
            </TabsContent>
          </Tabs>

          <NutritionFormFooter hint="Os gráficos de evolução são atualizados automaticamente após salvar.">
            <Button type="button" disabled={isPending} onClick={handleSave} className="gap-2">
              <Save className="size-4" />
              {isPending ? "Salvando..." : "Salvar antropometria"}
            </Button>
          </NutritionFormFooter>
        </NutritionSectionCard>
      ) : null}

      <NutritionSectionCard
        title="Evolução antropométrica"
        description="Gráficos comparativos entre consultas — peso, IMC, composição corporal e curvas pediátricas."
      >
        <NutritionEvolutionCharts records={records} />
      </NutritionSectionCard>

      <NutritionSectionCard title="Histórico de registros">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <NutritionHistoryItem
                key={record.id}
                title={formatPatientDate(record.consultationDate)}
                badge={RECORD_TYPE_LABELS[record.recordType]}
                actions={
                  !readOnly ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </NutritionSectionCard>
    </div>
  );
}
