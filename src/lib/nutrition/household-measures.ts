export const HOUSEHOLD_MEASURE_TYPES = [
  "tablespoon",
  "dessert_spoon",
  "ladle",
  "slice",
  "american_cup",
  "cup",
  "unit",
] as const;

export type HouseholdMeasureType = (typeof HOUSEHOLD_MEASURE_TYPES)[number];

export const HOUSEHOLD_MEASURE_LABELS: Record<HouseholdMeasureType, string> = {
  tablespoon: "Colher(es) de sopa",
  dessert_spoon: "Colher(es) de sobremesa",
  ladle: "Concha(s)",
  slice: "Fatia(s)",
  american_cup: "Copo(s) americano",
  cup: "Xícara(s)",
  unit: "Unidade(s)",
};

export type HouseholdMeasure = {
  type: HouseholdMeasureType;
  amount: number;
  gramsPerUnit: number;
};

export function formatHouseholdMeasure(measure: HouseholdMeasure) {
  const label = HOUSEHOLD_MEASURE_LABELS[measure.type];
  const amountLabel = Number.isInteger(measure.amount)
    ? String(measure.amount)
    : measure.amount.toFixed(1).replace(".", ",");

  const grams = Math.round(measure.amount * measure.gramsPerUnit * 10) / 10;

  return `${amountLabel} ${label} (${grams}g)`;
}

export function quantityFromHouseholdMeasure(measure: HouseholdMeasure) {
  return Math.round(measure.amount * measure.gramsPerUnit * 10) / 10;
}

export function syncHouseholdMeasureFromGrams(
  measure: HouseholdMeasure,
  quantityG: number
): HouseholdMeasure {
  if (measure.gramsPerUnit <= 0) {
    return measure;
  }

  return {
    ...measure,
    amount: Math.round((quantityG / measure.gramsPerUnit) * 10) / 10,
  };
}

export function createDefaultHouseholdMeasure(
  type: HouseholdMeasureType = "unit",
  servingSizeG = 100
): HouseholdMeasure {
  return {
    type,
    amount: 1,
    gramsPerUnit: servingSizeG,
  };
}
