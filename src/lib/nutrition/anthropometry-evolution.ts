import type {
  AdultAnthropometryData,
  AnthropometryRecordType,
  ChildAnthropometryData,
  NutritionAnthropometryRecord,
  PregnantAnthropometryData,
} from "@/lib/nutrition/types";
import { formatPatientDate } from "@/lib/patient-format";

export type AnthropometryEvolutionRow = {
  id: string;
  label: string;
  unit?: string;
  getValue: (formData: unknown, recordType: AnthropometryRecordType) => string;
};

function formatNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const formatted = Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(".", ",");

  return suffix ? `${formatted} ${suffix}` : formatted;
}

function adultData(formData: unknown) {
  return formData as AdultAnthropometryData;
}

function childData(formData: unknown) {
  return formData as ChildAnthropometryData;
}

function pregnantData(formData: unknown) {
  return formData as PregnantAnthropometryData;
}

export const ADULT_ANTHROPOMETRY_EVOLUTION_ROWS: AnthropometryEvolutionRow[] = [
  {
    id: "weightKg",
    label: "Peso",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).weightKg) : "—",
  },
  {
    id: "heightCm",
    label: "Altura",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).heightCm) : "—",
  },
  {
    id: "bmi",
    label: "IMC",
    unit: "kg/m²",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).bmi) : "—",
  },
  {
    id: "fatPercent",
    label: "% gordura",
    unit: "%",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.fatPercent)
        : "—",
  },
  {
    id: "musclePercent",
    label: "% massa muscular",
    unit: "%",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.musclePercent)
        : "—",
  },
  {
    id: "muscleMassKg",
    label: "Massa muscular",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.muscleMassKg)
        : "—",
  },
  {
    id: "totalBodyWaterKg",
    label: "Água corporal total",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.totalBodyWaterKg)
        : "—",
  },
  {
    id: "boneMassKg",
    label: "Massa óssea",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.boneMassKg)
        : "—",
  },
  {
    id: "fatMassKg",
    label: "Massa de gordura",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.fatMassKg)
        : "—",
  },
  {
    id: "leanMassKg",
    label: "Massa livre de gordura",
    unit: "kg",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.leanMassKg)
        : "—",
  },
  {
    id: "visceralFatIndex",
    label: "Gordura visceral",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.visceralFatIndex)
        : "—",
  },
  {
    id: "metabolicAge",
    label: "Idade metabólica",
    unit: "anos",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).bioimpedance.metabolicAge)
        : "—",
  },
  {
    id: "chestCm",
    label: "Tórax",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).measurements.chestCm) : "—",
  },
  {
    id: "abdomenCm",
    label: "Abdômen",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements.abdomenCm)
        : "—",
  },
  {
    id: "waistCm",
    label: "Cintura",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).measurements.waistCm) : "—",
  },
  {
    id: "hipCm",
    label: "Quadril",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult" ? formatNumber(adultData(formData).measurements.hipCm) : "—",
  },
  {
    id: "leftThighCm",
    label: "Coxa esquerda",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements?.leftThighCm)
        : "—",
  },
  {
    id: "rightThighCm",
    label: "Coxa direita",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements?.rightThighCm)
        : "—",
  },
  {
    id: "leftArmRelaxedCm",
    label: "Braço esq. relaxado",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements.leftArmRelaxedCm)
        : "—",
  },
  {
    id: "leftArmContractedCm",
    label: "Braço esq. contraído",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements.leftArmContractedCm)
        : "—",
  },
  {
    id: "rightArmRelaxedCm",
    label: "Braço dir. relaxado",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements.rightArmRelaxedCm)
        : "—",
  },
  {
    id: "rightArmContractedCm",
    label: "Braço dir. contraído",
    unit: "cm",
    getValue: (formData, type) =>
      type === "adult"
        ? formatNumber(adultData(formData).measurements.rightArmContractedCm)
        : "—",
  },
];

export const CHILD_ANTHROPOMETRY_EVOLUTION_ROWS: AnthropometryEvolutionRow[] = [
  {
    id: "ageMonths",
    label: "Idade",
    unit: "meses",
    getValue: (formData, type) =>
      type === "child" ? formatNumber(childData(formData).ageMonths) : "—",
  },
  {
    id: "weightKg",
    label: "Peso",
    unit: "kg",
    getValue: (formData, type) =>
      type === "child" ? formatNumber(childData(formData).weightKg) : "—",
  },
  {
    id: "heightCm",
    label: "Altura/comprimento",
    unit: "cm",
    getValue: (formData, type) =>
      type === "child" ? formatNumber(childData(formData).heightCm) : "—",
  },
  {
    id: "bmi",
    label: "IMC",
    unit: "kg/m²",
    getValue: (formData, type) =>
      type === "child" ? formatNumber(childData(formData).bmi) : "—",
  },
  {
    id: "weightAgeClassification",
    label: "Peso/idade",
    getValue: (formData, type) =>
      type === "child"
        ? childData(formData).weightAgeClassification || "—"
        : "—",
  },
  {
    id: "heightAgeClassification",
    label: "Altura/idade",
    getValue: (formData, type) =>
      type === "child"
        ? childData(formData).heightAgeClassification || "—"
        : "—",
  },
  {
    id: "bmiAgeClassification",
    label: "IMC/idade",
    getValue: (formData, type) =>
      type === "child" ? childData(formData).bmiAgeClassification || "—" : "—",
  },
];

export function getAnthropometryEvolutionRows(recordType: AnthropometryRecordType) {
  if (recordType === "child") {
    return CHILD_ANTHROPOMETRY_EVOLUTION_ROWS;
  }

  if (recordType === "adult") {
    return ADULT_ANTHROPOMETRY_EVOLUTION_ROWS;
  }

  return [];
}

export function sortAnthropometryRecords(records: NutritionAnthropometryRecord[]) {
  return [...records].sort((left, right) =>
    left.consultationDate.localeCompare(right.consultationDate)
  );
}

export function getAnthropometryColumnLabel(record: NutritionAnthropometryRecord) {
  return formatPatientDate(record.consultationDate);
}
