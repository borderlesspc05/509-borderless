"use client";

import { useEffect, useState, useTransition } from "react";
import { Calculator, Save, Zap } from "lucide-react";

import {
  listNutritionEnergyAction,
  saveNutritionEnergyAction,
} from "@/app/actions/nutrition-actions";
import { NutritionNumberField } from "@/components/nutrition/nutrition-number-field";
import {
  formatEnergyResult,
  NutritionFieldGroup,
  NutritionFormFooter,
  NutritionHistoryItem,
  NutritionSectionCard,
  NutritionStatCard,
  nutritionInputClassName,
} from "@/components/nutrition/nutrition-ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACTIVITY_FACTORS_ADULT,
  ACTIVITY_FACTORS_BOY,
  ACTIVITY_FACTORS_GIRL,
  ACTIVITY_FACTORS_PREGNANT,
  calculateAdultEnergy,
  calculateChildEnergy,
  calculatePregnantEnergy,
} from "@/lib/nutrition/calculations";
import type { EnergyPopulation, NutritionEnergyRecord } from "@/lib/nutrition/types";
import { formatPatientDateTime } from "@/lib/patient-format";

const POPULATION_LABELS: Record<EnergyPopulation, string> = {
  adult: "Adulto",
  child: "Criança",
  pregnant: "Gestante",
};

type NutritionEnergySectionProps = {
  patientId: string;
  readOnly?: boolean;
};

export function NutritionEnergySection({
  patientId,
  readOnly = false,
}: NutritionEnergySectionProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [population, setPopulation] = useState<EnergyPopulation>("adult");
  const [records, setRecords] = useState<NutritionEnergyRecord[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const [adultForm, setAdultForm] = useState({
    formula: "mifflin" as "harris" | "mifflin",
    sex: "female" as "male" | "female",
    weightKg: 70,
    heightCm: 165,
    ageYears: 35,
    activityFactor: 1.375,
  });

  const [childForm, setChildForm] = useState({
    sex: "female" as "male" | "female",
    ageYears: 8,
    ageMonths: undefined as number | undefined,
    weightKg: 28,
    heightCm: 130,
    activityFactor: 1.16,
  });

  const [pregnantForm, setPregnantForm] = useState({
    ageYears: 28,
    weightKg: 65,
    heightCm: 162,
    activityFactor: 1.12,
    trimester: 2 as 1 | 2 | 3,
  });

  useEffect(() => {
    void listNutritionEnergyAction(patientId).then((response) => {
      if (response.success && response.data) {
        setRecords(response.data.records);
      }
    });
  }, [patientId]);

  function handleCalculate() {
    if (population === "adult") {
      setResult(calculateAdultEnergy(adultForm));
      return;
    }
    if (population === "child") {
      setResult(calculateChildEnergy(childForm));
      return;
    }
    setResult(calculatePregnantEnergy(pregnantForm));
  }

  function handleSave() {
    if (!result) {
      toast.error({ title: "Calcule antes de salvar" });
      return;
    }

    startTransition(async () => {
      const formData =
        population === "adult"
          ? adultForm
          : population === "child"
            ? childForm
            : pregnantForm;

      const response = await saveNutritionEnergyAction({
        patientId,
        population,
        formula:
          population === "adult"
            ? adultForm.formula
            : population === "child"
              ? "eer_child"
              : "eer_pregnant",
        formData: formData as unknown as Record<string, unknown>,
        resultData: result,
      });

      if (!response.success) {
        toast.error({ title: "Erro", description: response.error });
        return;
      }

      toast.success({ title: "Cálculo salvo" });
      if (response.data) {
        setRecords((current) => [response.data!.record, ...current]);
      }
    });
  }

  const resultEntries = result ? formatEnergyResult(result) : [];

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <NutritionSectionCard
          icon={Zap}
          title="Cálculos energéticos"
          description="Harris-Benedict, Mifflin-St Jeor, EER para crianças e gestantes."
        >
          <Tabs
            value={population}
            onValueChange={(value) => setPopulation(value as EnergyPopulation)}
          >
            <TabsList className="mb-2">
              <TabsTrigger value="adult">Adultos</TabsTrigger>
              <TabsTrigger value="child">Crianças</TabsTrigger>
              <TabsTrigger value="pregnant">Gestantes</TabsTrigger>
            </TabsList>

            <TabsContent value="adult" className="mt-0">
              <NutritionFieldGroup title="Parâmetros — adulto" columns={3}>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Fórmula</Label>
                  <Select
                    value={adultForm.formula}
                    onValueChange={(value) =>
                      setAdultForm((current) => ({
                        ...current,
                        formula: value as "harris" | "mifflin",
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harris">Harris-Benedict</SelectItem>
                      <SelectItem value="mifflin">Mifflin-St Jeor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sexo</Label>
                  <Select
                    value={adultForm.sex}
                    onValueChange={(value) =>
                      setAdultForm((current) => ({
                        ...current,
                        sex: value as "male" | "female",
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="male">Masculino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <NutritionNumberField
                  id="adult-age"
                  label="Idade"
                  unit="anos"
                  value={adultForm.ageYears}
                  onChange={(value) =>
                    setAdultForm((current) => ({ ...current, ageYears: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="adult-weight-energy"
                  label="Peso"
                  unit="kg"
                  value={adultForm.weightKg}
                  onChange={(value) =>
                    setAdultForm((current) => ({ ...current, weightKg: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="adult-height-energy"
                  label="Altura"
                  unit="cm"
                  value={adultForm.heightCm}
                  onChange={(value) =>
                    setAdultForm((current) => ({ ...current, heightCm: value ?? 0 }))
                  }
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fator de atividade
                  </Label>
                  <Select
                    value={String(adultForm.activityFactor)}
                    onValueChange={(value) =>
                      setAdultForm((current) => ({
                        ...current,
                        activityFactor: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_FACTORS_ADULT.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </NutritionFieldGroup>
            </TabsContent>

            <TabsContent value="child" className="mt-0">
              <NutritionFieldGroup title="Parâmetros — criança" columns={3}>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Sexo</Label>
                  <Select
                    value={childForm.sex}
                    onValueChange={(value) =>
                      setChildForm((current) => ({
                        ...current,
                        sex: value as "male" | "female",
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Menina</SelectItem>
                      <SelectItem value="male">Menino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <NutritionNumberField
                  id="child-age-years"
                  label="Idade"
                  unit="anos"
                  value={childForm.ageYears}
                  onChange={(value) =>
                    setChildForm((current) => ({ ...current, ageYears: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="child-age-months-energy"
                  label="Idade (meses, 13–35)"
                  unit="meses"
                  value={childForm.ageMonths ?? null}
                  onChange={(value) =>
                    setChildForm((current) => ({
                      ...current,
                      ageMonths: value ?? undefined,
                    }))
                  }
                />
                <NutritionNumberField
                  id="child-weight-energy"
                  label="Peso"
                  unit="kg"
                  value={childForm.weightKg}
                  onChange={(value) =>
                    setChildForm((current) => ({ ...current, weightKg: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="child-height-energy"
                  label="Altura"
                  unit="cm"
                  value={childForm.heightCm}
                  onChange={(value) =>
                    setChildForm((current) => ({ ...current, heightCm: value ?? 0 }))
                  }
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Atividade física
                  </Label>
                  <Select
                    value={String(childForm.activityFactor)}
                    onValueChange={(value) =>
                      setChildForm((current) => ({
                        ...current,
                        activityFactor: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(childForm.sex === "female"
                        ? ACTIVITY_FACTORS_GIRL
                        : ACTIVITY_FACTORS_BOY
                      ).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </NutritionFieldGroup>
            </TabsContent>

            <TabsContent value="pregnant" className="mt-0">
              <NutritionFieldGroup title="Parâmetros — gestante" columns={3}>
                <NutritionNumberField
                  id="pregnant-age"
                  label="Idade"
                  unit="anos"
                  value={pregnantForm.ageYears}
                  onChange={(value) =>
                    setPregnantForm((current) => ({ ...current, ageYears: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="pregnant-weight-energy"
                  label="Peso"
                  unit="kg"
                  value={pregnantForm.weightKg}
                  onChange={(value) =>
                    setPregnantForm((current) => ({ ...current, weightKg: value ?? 0 }))
                  }
                />
                <NutritionNumberField
                  id="pregnant-height-energy"
                  label="Altura"
                  unit="cm"
                  value={pregnantForm.heightCm}
                  onChange={(value) =>
                    setPregnantForm((current) => ({ ...current, heightCm: value ?? 0 }))
                  }
                />
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Atividade física
                  </Label>
                  <Select
                    value={String(pregnantForm.activityFactor)}
                    onValueChange={(value) =>
                      setPregnantForm((current) => ({
                        ...current,
                        activityFactor: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_FACTORS_PREGNANT.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Trimestre</Label>
                  <Select
                    value={String(pregnantForm.trimester)}
                    onValueChange={(value) =>
                      setPregnantForm((current) => ({
                        ...current,
                        trimester: Number(value) as 1 | 2 | 3,
                      }))
                    }
                  >
                    <SelectTrigger className={nutritionInputClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º trimestre</SelectItem>
                      <SelectItem value="2">2º trimestre</SelectItem>
                      <SelectItem value="3">3º trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </NutritionFieldGroup>
            </TabsContent>
          </Tabs>

          {resultEntries.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {resultEntries.map((entry) => (
                <NutritionStatCard
                  key={entry.label}
                  label={entry.label}
                  value={entry.value}
                  accent={entry.accent}
                />
              ))}
            </div>
          ) : null}

          <NutritionFormFooter hint="Calcule primeiro, depois salve no histórico do paciente.">
            <Button type="button" variant="outline" onClick={handleCalculate} className="gap-2">
              <Calculator className="size-4" />
              Calcular
            </Button>
            <Button
              type="button"
              disabled={isPending || !result}
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="size-4" />
              Salvar cálculo
            </Button>
          </NutritionFormFooter>
        </NutritionSectionCard>
      ) : null}

      <NutritionSectionCard title="Histórico de cálculos">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cálculo salvo.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const entries = formatEnergyResult(record.resultData);
              const primary =
                entries.find((e) => e.accent)?.value ??
                entries.find((e) => e.label === "GET")?.value ??
                entries[0]?.value;

              return (
                <NutritionHistoryItem
                  key={record.id}
                  title={primary ?? "Cálculo energético"}
                  badge={POPULATION_LABELS[record.population]}
                  subtitle={`${record.formula} · ${formatPatientDateTime(record.createdAt)}`}
                >
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {entries.map((entry) => (
                      <NutritionStatCard
                        key={entry.label}
                        label={entry.label}
                        value={entry.value}
                        accent={entry.accent}
                      />
                    ))}
                  </div>
                </NutritionHistoryItem>
              );
            })}
          </div>
        )}
      </NutritionSectionCard>
    </div>
  );
}
