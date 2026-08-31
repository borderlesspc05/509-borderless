export const PEDI_TRANSFER_MODES = ["car", "bus"] as const;

export type PediTransferMode = (typeof PEDI_TRANSFER_MODES)[number];

export const PEDI_TRANSFER_MODE_LABELS: Record<PediTransferMode, string> = {
  car: "Carro",
  bus: "Ônibus",
};

/** Itens 11–15 da mobilidade (domínio C) — apenas uma variação por avaliação. */
export const PEDI_MOBILITY_TRANSFER_ITEM_IDS = [
  "MB-11",
  "MB-12",
  "MB-13",
  "MB-14",
  "MB-15",
] as const;

export const PEDI_MOBILITY_TRANSFER_TEXTS: Record<
  PediTransferMode,
  readonly [string, string, string, string, string]
> = {
  car: [
    "Entra no carro com assistência máxima",
    "Entra no carro com assistência mínima",
    "Entra no carro de forma independente",
    "Sai do carro com assistência",
    "Sai do carro de forma independente",
  ],
  bus: [
    "Entra no ônibus com assistência máxima",
    "Entra no ônibus com assistência mínima",
    "Entra no ônibus de forma independente",
    "Sai do ônibus com assistência",
    "Sai do ônibus de forma independente",
  ],
};

export const PEDI_CAREGIVER_TRANSFER_LABELS: Record<PediTransferMode, string> = {
  car: "Transferências para o carro",
  bus: "Transferências para o ônibus",
};

export function isPediTransferMode(value: unknown): value is PediTransferMode {
  return value === "car" || value === "bus";
}

export function getMobilityTransferDomainLabel(mode: PediTransferMode) {
  return mode === "car"
    ? "Transferências — carro"
    : "Transferências — ônibus";
}
