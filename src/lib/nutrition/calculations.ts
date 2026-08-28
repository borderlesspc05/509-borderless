import type { MealPlanFoodItem, MealPlanMacros } from "@/lib/nutrition/types";

export const ACTIVITY_FACTORS_ADULT = [
  { value: "1.2", label: "Sedentário (1,20)" },
  { value: "1.375", label: "Levemente ativo (1,375)" },
  { value: "1.55", label: "Moderadamente ativo (1,55)" },
  { value: "1.725", label: "Muito ativo (1,725)" },
  { value: "1.9", label: "Extremamente ativo (1,90)" },
] as const;

export const ACTIVITY_FACTORS_PREGNANT = [
  { value: "1", label: "Sedentária (1,00)" },
  { value: "1.12", label: "Baixa atividade (1,12)" },
  { value: "1.27", label: "Ativa (1,27)" },
  { value: "1.45", label: "Muito ativa (1,45)" },
] as const;

export const ACTIVITY_FACTORS_GIRL = [
  { value: "1", label: "Sedentária (1,00)" },
  { value: "1.16", label: "Baixa atividade (1,16)" },
  { value: "1.31", label: "Ativa (1,31)" },
  { value: "1.56", label: "Muito ativa (1,56)" },
] as const;

export const ACTIVITY_FACTORS_BOY = [
  { value: "1", label: "Sedentário (1,00)" },
  { value: "1.13", label: "Baixa atividade (1,13)" },
  { value: "1.26", label: "Ativo (1,26)" },
  { value: "1.42", label: "Muito ativo (1,42)" },
] as const;

export function calculateBmi(weightKg: number, heightCm: number) {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

export function classifyAdultBmi(bmi: number) {
  if (bmi < 18.5) return "Baixo peso";
  if (bmi < 25) return "Eutrofia";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade grau I";
  if (bmi < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export function classifyBodyFat(percent: number, sex: "male" | "female") {
  if (sex === "male") {
    if (percent < 6) return "Essencial";
    if (percent < 14) return "Atlético";
    if (percent < 18) return "Fitness";
    if (percent < 25) return "Aceitável";
    return "Obesidade";
  }
  if (percent < 14) return "Essencial";
  if (percent < 21) return "Atlético";
  if (percent < 25) return "Fitness";
  if (percent < 32) return "Aceitável";
  return "Obesidade";
}

export function harrisBenedictBmr(input: {
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  ageYears: number;
}) {
  const { sex, weightKg, heightCm, ageYears } = input;
  if (sex === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears;
}

export function mifflinStJeorBmr(input: {
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  ageYears: number;
}) {
  const { sex, weightKg, heightCm, ageYears } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateAdultEnergy(input: {
  formula: "harris" | "mifflin";
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  ageYears: number;
  activityFactor: number;
}) {
  const bmr =
    input.formula === "harris"
      ? harrisBenedictBmr(input)
      : mifflinStJeorBmr(input);
  const get = bmr * input.activityFactor;
  return {
    bmr: Math.round(bmr),
    get: Math.round(get),
    formulaLabel:
      input.formula === "harris"
        ? "Harris-Benedict (revisada)"
        : "Mifflin-St Jeor",
  };
}

export function calculatePregnantEnergy(input: {
  ageYears: number;
  weightKg: number;
  heightCm: number;
  activityFactor: number;
  trimester: 1 | 2 | 3;
}) {
  const heightM = input.heightCm / 100;
  const eer =
    354 -
    6.91 * input.ageYears +
    input.activityFactor * (9.36 * input.weightKg + 726 * heightM);
  const trimesterBonus = input.trimester === 1 ? 0 : input.trimester === 2 ? 340 : 452;
  const total = eer + trimesterBonus;
  return {
    eer: Math.round(eer),
    trimesterBonus,
    total: Math.round(total),
  };
}

export function calculateChildEnergy(input: {
  sex: "male" | "female";
  ageYears: number;
  weightKg: number;
  heightCm: number;
  activityFactor: number;
  ageMonths?: number;
}) {
  const heightM = input.heightCm / 100;

  if (input.ageMonths !== undefined && input.ageMonths >= 13 && input.ageMonths <= 35) {
    const eer = 89 * input.weightKg - 100 + 20;
    return { eer: Math.round(eer), formula: "13 a 35 meses" };
  }

  if (input.sex === "female") {
    const eer =
      135.3 -
      30.8 * input.ageYears +
      input.activityFactor * (10 * input.weightKg + 934 * heightM) +
      20;
    return { eer: Math.round(eer), formula: "Meninas 3 a 18 anos" };
  }

  const eer =
    88.5 -
    61.9 * input.ageYears +
    input.activityFactor * (26.7 * input.weightKg + 903 * heightM) +
    20;
  return { eer: Math.round(eer), formula: "Meninos 3 a 18 anos" };
}

export function calculateAgeYears(birthDate: string, referenceDate = new Date()) {
  const birth = new Date(birthDate);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function calculateAgeMonths(birthDate: string, referenceDate = new Date()) {
  const birth = new Date(birthDate);
  let months =
    (referenceDate.getFullYear() - birth.getFullYear()) * 12 +
    (referenceDate.getMonth() - birth.getMonth());
  if (referenceDate.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function summarizeMealPlanMacros(foods: MealPlanFoodItem[]): MealPlanMacros {
  return foods.reduce(
    (acc, food) => ({
      caloriesKcal: acc.caloriesKcal + food.caloriesKcal,
      carbsG: acc.carbsG + food.carbsG,
      proteinG: acc.proteinG + food.proteinG,
      fatG: acc.fatG + food.fatG,
    }),
    { caloriesKcal: 0, carbsG: 0, proteinG: 0, fatG: 0 }
  );
}

export function scaleFoodNutrients(
  food: {
    servingSizeG: number;
    caloriesKcal: number;
    carbsG: number;
    proteinG: number;
    fatG: number;
  },
  quantityG: number
) {
  const factor = quantityG / food.servingSizeG;
  return {
    caloriesKcal: Math.round(food.caloriesKcal * factor * 10) / 10,
    carbsG: Math.round(food.carbsG * factor * 10) / 10,
    proteinG: Math.round(food.proteinG * factor * 10) / 10,
    fatG: Math.round(food.fatG * factor * 10) / 10,
  };
}

export const PREGNANCY_WEEKS = Array.from({ length: 40 }, (_, index) => index + 1);

export function emptyAdultAnthropometry() {
  return {
    weightKg: null,
    heightCm: null,
    bmi: null,
    bioimpedance: {
      fatPercent: null,
      fatClassification: "",
      musclePercent: null,
      muscleMassKg: null,
      totalBodyWaterKg: null,
      boneMassKg: null,
      fatMassKg: null,
      leanMassKg: null,
      visceralFatIndex: null,
      metabolicAge: null,
    },
    measurements: {
      chestCm: null,
      abdomenCm: null,
      waistCm: null,
      hipCm: null,
      leftArmRelaxedCm: null,
      leftArmContractedCm: null,
      rightArmRelaxedCm: null,
      rightArmContractedCm: null,
      leftThighCm: null,
      rightThighCm: null,
    },
  };
}

export function emptyChildAnthropometry(): import("@/lib/nutrition/types").ChildAnthropometryData {
  return {
    ageMonths: null,
    weightKg: null,
    heightCm: null,
    bmi: null,
    weightAgeClassification: "",
    heightAgeClassification: "",
    bmiAgeClassification: "",
    sex: "male",
  };
}

export function emptyPregnantAnthropometry(): import("@/lib/nutrition/types").PregnantAnthropometryData {
  const weeklyWeights: Record<string, number | null> = {};
  for (const week of PREGNANCY_WEEKS) {
    weeklyWeights[String(week)] = null;
  }
  return {
    heightCm: null,
    prePregnancyWeightKg: null,
    nutritionalStatus: "normal",
    weeklyWeights,
  };
}
