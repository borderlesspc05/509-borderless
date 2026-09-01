const CARE_MODALITIES_COLUMN_PATTERN = /care_modalities/i;

export function isMissingCareModalitiesColumn(message?: string | null) {
  return Boolean(message && CARE_MODALITIES_COLUMN_PATTERN.test(message));
}

export function omitCareModalities<T extends { care_modalities?: unknown }>(
  record: T
): Omit<T, "care_modalities"> {
  const { care_modalities: _careModalities, ...rest } = record;
  return rest;
}
