export const CARE_MODALITY_VALUES = ["ABA", "CONVENTIONAL"] as const;

export type CareModality = (typeof CARE_MODALITY_VALUES)[number];

export const careModalityItems = [
  { label: "ABA", value: "ABA" as const },
  { label: "Convencional", value: "CONVENTIONAL" as const },
];

export function normalizeCareModalities(
  values: string[] | null | undefined
): CareModality[] {
  if (!values?.length) {
    return [];
  }

  return CARE_MODALITY_VALUES.filter((value) => values.includes(value));
}

export function formatCareModalities(
  values: string[] | null | undefined,
  fallback = "—"
) {
  const normalized = normalizeCareModalities(values);

  if (normalized.length === 0) {
    return fallback;
  }

  return normalized
    .map((value) => careModalityItems.find((item) => item.value === value)?.label ?? value)
    .join(" · ");
}

export function toggleCareModality(
  current: CareModality[],
  modality: CareModality
): CareModality[] {
  return current.includes(modality)
    ? current.filter((value) => value !== modality)
    : [...current, modality];
}
