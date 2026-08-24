export type AnthropometryRecordType = "adult" | "child" | "pregnant";

export type EnergyPopulation = "adult" | "child" | "pregnant";

export type AdultAnthropometryData = {
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  bioimpedance: {
    fatPercent: number | null;
    fatClassification: string;
    musclePercent: number | null;
    muscleMassKg: number | null;
    totalBodyWaterKg: number | null;
    boneMassKg: number | null;
    fatMassKg: number | null;
    leanMassKg: number | null;
    visceralFatIndex: number | null;
    metabolicAge: number | null;
  };
  measurements: {
    chestCm: number | null;
    abdomenCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
    leftArmRelaxedCm: number | null;
    leftArmContractedCm: number | null;
    rightArmRelaxedCm: number | null;
    rightArmContractedCm: number | null;
  };
};

export type ChildAnthropometryData = {
  ageMonths: number | null;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  weightAgeClassification: string;
  heightAgeClassification: string;
  bmiAgeClassification: string;
  sex: "male" | "female";
};

export type PregnantAnthropometryData = {
  heightCm: number | null;
  prePregnancyWeightKg: number | null;
  nutritionalStatus: "underweight" | "normal" | "overweight" | "obese";
  weeklyWeights: Record<string, number | null>;
};

export type MealPlanFoodItem = {
  foodId: string;
  foodName: string;
  quantityG: number;
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

export type MealPlanMeal = {
  id: string;
  time: string;
  name: string;
  foods: MealPlanFoodItem[];
};

export type MealPlanMacros = {
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

export type NutritionFood = {
  id: string;
  name: string;
  source: "tbca" | "tucunduva" | "custom";
  servingSizeG: number;
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  isCustom: boolean;
};

export type NutritionAnamnesisRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  consultationDate: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NutritionAnthropometryRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  recordType: AnthropometryRecordType;
  consultationDate: string;
  formData: AdultAnthropometryData | ChildAnthropometryData | PregnantAnthropometryData;
  createdAt: string;
  updatedAt: string;
};

export type NutritionEnergyRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  population: EnergyPopulation;
  formula: string;
  formData: Record<string, unknown>;
  resultData: Record<string, unknown>;
  createdAt: string;
};

export type NutritionMealPlanRecord = {
  id: string;
  patientId: string | null;
  professionalId: string;
  title: string;
  meals: MealPlanMeal[];
  macros: MealPlanMacros;
  notes: string | null;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NutritionTemplateRecord = {
  id: string;
  title: string;
  conditionTag: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientNutritionDocumentRecord = {
  id: string;
  patientId: string;
  professionalId: string;
  title: string;
  content: string;
  templateId: string | null;
  createdAt: string;
};
