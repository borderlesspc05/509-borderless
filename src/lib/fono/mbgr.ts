export const MBGR_TEMPLATE_NAME = "MBGR — Exame Miofuncional Orofacial";
export const MBGR_INSTRUMENT = MBGR_TEMPLATE_NAME;

function checkboxMap<T extends string>(
  keys: readonly T[]
): Record<T, boolean> {
  return Object.fromEntries(keys.map((key) => [key, false])) as Record<
    T,
    boolean
  >;
}

export const MBGR_POSTURA_CABECA = [
  { key: "frontalNormal", label: "Frontal normal" },
  { key: "rotacaoD", label: "Rotação D" },
  { key: "rotacaoE", label: "Rotação E" },
  { key: "inclinacaoD", label: "Inclinação D" },
  { key: "inclinacaoE", label: "Inclinação E" },
  { key: "anteriorizada", label: "Anteriorizada" },
  { key: "flexao", label: "Flexão" },
  { key: "extensao", label: "Extensão" },
] as const;

export const MBGR_RESPIRACAO = [
  { key: "nasal", label: "Nasal" },
  { key: "oral", label: "Oral" },
  { key: "oronasal", label: "Oronasal" },
] as const;

export const MBGR_MASTIGACAO = [
  { key: "bilateral", label: "Bilateral" },
  { key: "unilateralD", label: "Unilateral D" },
  { key: "unilateralE", label: "Unilateral E" },
  { key: "labiosFechados", label: "Lábios fechados" },
  { key: "labiosEntreabertos", label: "Lábios entreabertos" },
  { key: "ruido", label: "Ruído" },
  { key: "dor", label: "Dor/desconforto" },
  { key: "escape", label: "Escape de alimento" },
] as const;

export const MBGR_DEGLUTICAO = [
  { key: "dificuldade", label: "Dificuldade" },
  { key: "ruido", label: "Ruído" },
  { key: "engasgos", label: "Engasgos" },
  { key: "odinofagia", label: "Odinofagia" },
  { key: "refluxoNasal", label: "Refluxo nasal" },
  { key: "escapeAnterior", label: "Escape anterior" },
  { key: "tosse", label: "Tosse" },
  { key: "residuos", label: "Resíduos após deglutição" },
] as const;

export const MBGR_FALA = [
  { key: "omissao", label: "Omissão" },
  { key: "substituicao", label: "Substituição" },
  { key: "inteligibilidadePrejudicada", label: "Inteligibilidade prejudicada" },
  { key: "interposicaoLingua", label: "Interposição de língua" },
  { key: "salivacao", label: "Salivação excessiva" },
] as const;

export type MbgrFormData = {
  posturaCabeca: Record<(typeof MBGR_POSTURA_CABECA)[number]["key"], boolean>;
  respiracao: Record<(typeof MBGR_RESPIRACAO)[number]["key"], boolean>;
  labiosHabitual: string;
  linguaHabitual: string;
  tonusLabios: string;
  tonusLingua: string;
  freioLingual: string;
  atm: string;
  mastigacao: Record<(typeof MBGR_MASTIGACAO)[number]["key"], boolean>;
  degluticao: Record<(typeof MBGR_DEGLUTICAO)[number]["key"], boolean>;
  fala: Record<(typeof MBGR_FALA)[number]["key"], boolean>;
  voz: string;
  conclusao: string;
  observacoes: string;
};

export function createEmptyMbgrFormData(): MbgrFormData {
  return {
    posturaCabeca: checkboxMap(MBGR_POSTURA_CABECA.map((o) => o.key)),
    respiracao: checkboxMap(MBGR_RESPIRACAO.map((o) => o.key)),
    labiosHabitual: "",
    linguaHabitual: "",
    tonusLabios: "",
    tonusLingua: "",
    freioLingual: "",
    atm: "",
    mastigacao: checkboxMap(MBGR_MASTIGACAO.map((o) => o.key)),
    degluticao: checkboxMap(MBGR_DEGLUTICAO.map((o) => o.key)),
    fala: checkboxMap(MBGR_FALA.map((o) => o.key)),
    voz: "",
    conclusao: "",
    observacoes: "",
  };
}

export function countMbgrFilledFields(data: MbgrFormData): number {
  let count = 0;
  const visit = (value: unknown) => {
    if (typeof value === "boolean" && value) count += 1;
    else if (typeof value === "string" && value.trim()) count += 1;
    else if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };
  visit(data);
  return count;
}
