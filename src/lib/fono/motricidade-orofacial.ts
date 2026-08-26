export const MOTRICIDADE_TEMPLATE_NAME =
  "Motricidade Orofacial — Avaliação Fonoaudiológica Infantil";
export const MOTRICIDADE_INSTRUMENT = MOTRICIDADE_TEMPLATE_NAME;

function checkboxMap<T extends string>(
  keys: readonly T[]
): Record<T, boolean> {
  return Object.fromEntries(keys.map((key) => [key, false])) as Record<
    T,
    boolean
  >;
}

export const DNPM_OPTIONS = [
  { key: "controleCervical", label: "Controle cervical presente" },
  { key: "controleTronco", label: "Controle de tronco presente" },
  { key: "sentaComApoio", label: "Senta com apoio" },
  { key: "sentaSemApoio", label: "Senta sem apoio" },
  { key: "andaComApoio", label: "Anda com apoio" },
  { key: "andaSemApoio", label: "Anda sem apoio" },
  { key: "cadeirante", label: "Cadeirante" },
  { key: "reflexosAdequados", label: "Reflexos posturais adequados" },
] as const;

export const FACE_TIPO_OPTIONS = [
  { value: "dolico", label: "Dólicofacial" },
  { value: "mesio", label: "Mesiofacial" },
  { value: "braqui", label: "Braquifacial" },
] as const;

export const LABIOS_POSICAO_OPTIONS = [
  { value: "abertos", label: "Abertos" },
  { value: "entreabertos", label: "Entreabertos" },
  { value: "fechadosComTensao", label: "Fechados com tensão" },
  { value: "fechadosSemTensao", label: "Fechados sem tensão" },
] as const;

export const TONICIDADE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "hipertonico", label: "Hipertônico" },
  { value: "hipotonico", label: "Hipotônico" },
] as const;

export const RESPIRACAO_MODO_OPTIONS = [
  { value: "nasal", label: "Nasal" },
  { value: "bucal", label: "Bucal" },
  { value: "mista", label: "Mista" },
] as const;

export const MASTIGACAO_SOLIDO_OPTIONS = [
  { key: "mordeIncisivos", label: "Morde com os incisivos" },
  { key: "bocaFechada", label: "Boca fechada" },
  { key: "projecaoLingua", label: "Projeção de língua" },
  { key: "bocaAberta", label: "Boca aberta" },
  { key: "lateralizacaoMandibula", label: "Lateralização de mandíbula" },
  { key: "lateralizaBolo", label: "Lateraliza o bolo alimentar" },
  { key: "unilateral", label: "Mastigação unilateral" },
  { key: "escape", label: "Escape de alimento" },
  { key: "amassaLingua", label: "Amassa com a língua" },
  { key: "posteriores", label: "Mastiga com os posteriores" },
  { key: "bilateral", label: "Mastigação bilateral" },
  { key: "ausente", label: "Mastigação ausente" },
] as const;

export const DEGLUTICAO_SINAIS_OPTIONS = [
  { key: "contracaoMasseter", label: "Contração de masseter" },
  { key: "projecaoCabeca", label: "Projeção de cabeça/pescoço" },
  { key: "tensaoMentual", label: "Tensão de mentual" },
  { key: "projecaoLingua", label: "Projeção de língua" },
  { key: "refluxo", label: "Refluxo" },
] as const;

export const ASPIRACAO_OPTIONS = [
  { key: "engasgos", label: "Engasgos" },
  { key: "tosse", label: "Tosse" },
  { key: "fadiga", label: "Fadiga" },
  { key: "sonolencia", label: "Sonolência" },
  { key: "cianose", label: "Cianose" },
  { key: "dispneia", label: "Dispneia" },
] as const;

export type MotricidadeFormData = {
  antropomorficas: string;
  dnpm: Record<(typeof DNPM_OPTIONS)[number]["key"], boolean>;
  dnpmObs: string;
  tipoFacial: string;
  dentesTipo: string;
  oclusao: string;
  labiosPosicao: string;
  labiosTonus: string;
  linguaPosicao: string;
  linguaTonus: string;
  freioLingual: string;
  palatoDuro: string;
  atm: string;
  respiracaoModo: string;
  respiracaoTipo: string;
  mastigacaoSolido: Record<
    (typeof MASTIGACAO_SOLIDO_OPTIONS)[number]["key"],
    boolean
  >;
  degluticaoSinais: Record<
    (typeof DEGLUTICAO_SINAIS_OPTIONS)[number]["key"],
    boolean
  >;
  coordenacaoMdr: string;
  aspiracao: Record<(typeof ASPIRACAO_OPTIONS)[number]["key"], boolean>;
  vozIntensidade: string;
  vozTonalidade: string;
  vozRitmo: string;
  observacoes: string;
};

export function createEmptyMotricidadeFormData(): MotricidadeFormData {
  return {
    antropomorficas: "",
    dnpm: checkboxMap(DNPM_OPTIONS.map((o) => o.key)),
    dnpmObs: "",
    tipoFacial: "",
    dentesTipo: "",
    oclusao: "",
    labiosPosicao: "",
    labiosTonus: "",
    linguaPosicao: "",
    linguaTonus: "",
    freioLingual: "",
    palatoDuro: "",
    atm: "",
    respiracaoModo: "",
    respiracaoTipo: "",
    mastigacaoSolido: checkboxMap(MASTIGACAO_SOLIDO_OPTIONS.map((o) => o.key)),
    degluticaoSinais: checkboxMap(DEGLUTICAO_SINAIS_OPTIONS.map((o) => o.key)),
    coordenacaoMdr: "",
    aspiracao: checkboxMap(ASPIRACAO_OPTIONS.map((o) => o.key)),
    vozIntensidade: "",
    vozTonalidade: "",
    vozRitmo: "",
    observacoes: "",
  };
}

export function countMotricidadeFilledFields(data: MotricidadeFormData): number {
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
