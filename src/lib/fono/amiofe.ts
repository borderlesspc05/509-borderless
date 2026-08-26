export const AMIOFE_TEMPLATE_NAME =
  "AMIOFE — Avaliação Miofuncional Orofacial com Escores";
export const AMIOFE_INSTRUMENT = AMIOFE_TEMPLATE_NAME;

export const AMIOFE_SCORE_3_2_1 = [
  { value: 3, label: "Normal / adequado" },
  { value: 2, label: "Leve / com tensão / adaptação" },
  { value: 1, label: "Severo / ausente / não realiza" },
] as const;

export const AMIOFE_MASTIGACAO_TRITURACAO = [
  { value: 4, label: "Bilateral alternada" },
  { value: 3, label: "Simultânea (vertical)" },
  { value: 2, label: "Unilateral preferencial (~66%)" },
  { value: 1, label: "Crônica / anterior / não tritura" },
] as const;

export const AMIOFE_MOBILIDADE_LABIOS = [
  { key: "protrusao", label: "Protrusão" },
  { key: "retracao", label: "Retração" },
  { key: "lateralidadeD", label: "Lateralidade D" },
  { key: "lateralidadeE", label: "Lateralidade E" },
] as const;

export const AMIOFE_MOBILIDADE_LINGUA = [
  { key: "protrair", label: "Protrair" },
  { key: "retrair", label: "Retrair" },
  { key: "lateralD", label: "Lateral D" },
  { key: "lateralE", label: "Lateral E" },
  { key: "elevar", label: "Elevar" },
  { key: "abaixar", label: "Abaixar" },
] as const;

export const AMIOFE_MOBILIDADE_MANDIBULA = [
  { key: "abaixar", label: "Abaixar" },
  { key: "elevar", label: "Elevar" },
  { key: "lateralD", label: "Lateral D" },
  { key: "lateralE", label: "Lateral E" },
  { key: "protrair", label: "Protrair" },
] as const;

export const AMIOFE_MOBILIDADE_BOCHECHAS = [
  { key: "inflar", label: "Inflar" },
  { key: "suflar", label: "Suflar" },
  { key: "retrair", label: "Retrair" },
  { key: "lateralizarAr", label: "Lateralizar o ar" },
] as const;

export type AmiofeFormData = {
  aparencia: {
    labios: number | null;
    mandibula: number | null;
    bochechas: number | null;
    simetriaFacial: number | null;
    posicaoLingua: number | null;
    palatoDuro: number | null;
  };
  mobilidadeLabios: Record<
    (typeof AMIOFE_MOBILIDADE_LABIOS)[number]["key"],
    number | null
  >;
  mobilidadeLingua: Record<
    (typeof AMIOFE_MOBILIDADE_LINGUA)[number]["key"],
    number | null
  >;
  mobilidadeMandibula: Record<
    (typeof AMIOFE_MOBILIDADE_MANDIBULA)[number]["key"],
    number | null
  >;
  mobilidadeBochechas: Record<
    (typeof AMIOFE_MOBILIDADE_BOCHECHAS)[number]["key"],
    number | null
  >;
  funcoes: {
    respiracao: number | null;
    degluticaoLabios: number | null;
    degluticaoLingua: number | null;
    degluticaoSinais: number | null;
    degluticaoEficienciaSolido: number | null;
    degluticaoEficienciaLiquido: number | null;
    mastigacaoMordida: number | null;
    mastigacaoTrituracao: number | null;
    mastigacaoSinais: number | null;
  };
  oclusaoNotas: string;
  alimentoUtilizado: string;
  tempoIngestao: string;
  observacoes: string;
};

function emptyScores<T extends string>(
  items: readonly { key: T }[]
): Record<T, number | null> {
  return Object.fromEntries(items.map((item) => [item.key, null])) as Record<
    T,
    number | null
  >;
}

export function createEmptyAmiofeFormData(): AmiofeFormData {
  return {
    aparencia: {
      labios: null,
      mandibula: null,
      bochechas: null,
      simetriaFacial: null,
      posicaoLingua: null,
      palatoDuro: null,
    },
    mobilidadeLabios: emptyScores(AMIOFE_MOBILIDADE_LABIOS),
    mobilidadeLingua: emptyScores(AMIOFE_MOBILIDADE_LINGUA),
    mobilidadeMandibula: emptyScores(AMIOFE_MOBILIDADE_MANDIBULA),
    mobilidadeBochechas: emptyScores(AMIOFE_MOBILIDADE_BOCHECHAS),
    funcoes: {
      respiracao: null,
      degluticaoLabios: null,
      degluticaoLingua: null,
      degluticaoSinais: null,
      degluticaoEficienciaSolido: null,
      degluticaoEficienciaLiquido: null,
      mastigacaoMordida: null,
      mastigacaoTrituracao: null,
      mastigacaoSinais: null,
    },
    oclusaoNotas: "",
    alimentoUtilizado: "",
    tempoIngestao: "",
    observacoes: "",
  };
}

export function countAmiofeFilledFields(data: AmiofeFormData): number {
  let count = 0;
  const visit = (value: unknown) => {
    if (typeof value === "number") count += 1;
    else if (typeof value === "string" && value.trim()) count += 1;
    else if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };
  visit(data);
  return count;
}

export function sumAmiofeScores(data: AmiofeFormData): number | null {
  const scores: number[] = [];
  const collect = (value: unknown) => {
    if (typeof value === "number") scores.push(value);
    else if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(collect);
    }
  };
  collect(data.aparencia);
  collect(data.mobilidadeLabios);
  collect(data.mobilidadeLingua);
  collect(data.mobilidadeMandibula);
  collect(data.mobilidadeBochechas);
  collect(data.funcoes);
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null;
}
