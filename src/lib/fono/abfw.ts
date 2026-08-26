export const ABFW_TEMPLATE_NAME = "ABFW — Prova de Fonologia";
export const ABFW_INSTRUMENT = ABFW_TEMPLATE_NAME;

export const ABFW_PHONEMES = [
  "p",
  "t",
  "k",
  "b",
  "d",
  "g",
  "m",
  "n",
  "f",
  "s",
  "ʃ",
  "v",
  "z",
  "ʒ",
  "l",
  "ɾ",
  "R",
  "ʎ",
  "ɲ",
  "w",
  "j",
] as const;

export type AbfwPhonemeStatus = "" | "adquirido" | "omitido" | "substituido" | "distorcido";

export const ABFW_STATUS_OPTIONS = [
  { value: "adquirido", label: "Adquirido" },
  { value: "omitido", label: "Omitido" },
  { value: "substituido", label: "Substituído" },
  { value: "distorcido", label: "Distorcido" },
] as const;

export type AbfwFormData = {
  emissaoFiguras: string;
  recepcaoLista: string;
  quadroFonologico: Record<(typeof ABFW_PHONEMES)[number], AbfwPhonemeStatus>;
  processosFonologicos: string;
  inteligibilidade: string;
  observacoes: string;
};

export function createEmptyAbfwFormData(): AbfwFormData {
  return {
    emissaoFiguras: "",
    recepcaoLista: "",
    quadroFonologico: Object.fromEntries(
      ABFW_PHONEMES.map((phoneme) => [phoneme, "" as AbfwPhonemeStatus])
    ) as Record<(typeof ABFW_PHONEMES)[number], AbfwPhonemeStatus>,
    processosFonologicos: "",
    inteligibilidade: "",
    observacoes: "",
  };
}

export function countAbfwFilledFields(data: AbfwFormData): number {
  let count = 0;
  if (data.emissaoFiguras.trim()) count += 1;
  if (data.recepcaoLista.trim()) count += 1;
  if (data.processosFonologicos.trim()) count += 1;
  if (data.inteligibilidade.trim()) count += 1;
  if (data.observacoes.trim()) count += 1;
  for (const status of Object.values(data.quadroFonologico)) {
    if (status) count += 1;
  }
  return count;
}
