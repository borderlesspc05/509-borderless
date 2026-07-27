export const DICCAO_TEMPLATE_NAME = "Avaliação da Dicção";
export const DICCAO_INSTRUMENT = "Avaliação da Dicção";

export const ARTICULACAO_OBSERVACAO_OPTIONS = [
  {
    key: "semAnormalidades",
    label: "Sem anormalidades — realiza 5 séries em 5 segundos",
  },
  {
    key: "movimentosInconsistentes",
    label: "Movimentos inconsistentes/irregulares ou deterioração progressiva",
  },
  {
    key: "reducaoVelocidade",
    label: "Redução da velocidade, tremor ou movimentos grosseiros",
  },
  {
    key: "minimaForca",
    label: "Mínima força / ausência de vedamento labial",
  },
] as const;

export const INTENSIDADE_VOCAL_OPTIONS = [
  { value: "adequada", label: "Adequada" },
  { value: "alta", label: "Alta" },
  { value: "baixa", label: "Baixa" },
] as const;

export const DIADOCOCINESIA_OPTIONS = [
  { key: "amrLento", label: "O AMR é lento" },
  { key: "amrRapido", label: "O AMR é excessivamente rápido" },
  { key: "amrNaoRitmado", label: "O AMR não é ritmado" },
  { key: "tremor", label: "Ocorre tremor" },
  { key: "intervaloIdentico", label: "Há intervalo idêntico entre as sílabas" },
  {
    key: "silabasDistorcidas",
    label: "As sílabas são eventualmente distorcidas ou mal produzidas",
  },
  { key: "hipernasalidade", label: "Há hipernasalidade" },
  { key: "emissaoNasal", label: "Há emissão nasal" },
] as const;

export const MOBILIDADE_SCALE = [
  { value: 0, label: "Adequado" },
  { value: 1, label: "Pequena alteração" },
  { value: 2, label: "Grande alteração" },
  { value: 3, label: "Ausente" },
] as const;

export type MobilidadeScore = 0 | 1 | 2 | 3;

export const MOBILIDADE_LABIOS_ITEMS = [
  { key: "protrairFechados", label: "Protrair fechados" },
  { key: "retrairFechados", label: "Retrair fechados" },
  { key: "protrairAbertos", label: "Protrair abertos" },
  { key: "retrairAbertos", label: "Retrair abertos" },
  { key: "protrairFechadosD", label: "Protrair fechados à D" },
  { key: "protrairFechadosE", label: "Protrair fechados à E" },
  { key: "estalarProtraidos", label: "Estalar protraídos" },
  { key: "estalarRetraidos", label: "Estalar retraídos" },
] as const;

export const MOBILIDADE_LINGUA_ITEMS = [
  { key: "protrair", label: "Protrair" },
  {
    key: "tocarComissurasLabios",
    label: "Tocar o ápice sequencialmente nas comissuras D/E e nos lábios S/I",
  },
  { key: "tocarPapilaIncisiva", label: "Tocar o ápice na papila incisiva" },
  { key: "tocarBochechaD", label: "Tocar o ápice na bochecha D" },
  { key: "tocarBochechaE", label: "Tocar o ápice na bochecha E" },
  { key: "estalarApice", label: "Estalar o ápice" },
  { key: "sugarPalato", label: "Sugar a língua no palato" },
  { key: "vibrar", label: "Vibrar" },
] as const;

export type DiccaoFormData = {
  articulacao: {
    uiRepeticoesSegundos: string;
    pRepeticoesSegundos: string;
    observacoes: Record<
      (typeof ARTICULACAO_OBSERVACAO_OPTIONS)[number]["key"],
      boolean
    >;
    outrasObservacoes: string;
  };
  intensidadeVocal: "" | "adequada" | "alta" | "baixa";
  tempoMaximoFonacao: {
    a: string;
    i: string;
    s: string;
    z: string;
  };
  diadocinesia: Record<(typeof DIADOCOCINESIA_OPTIONS)[number]["key"], boolean>;
  falaAutomatica: {
    omissao: string;
    substituicao: string;
    distorcao: string;
  };
  mobilidadeLabios: Record<
    (typeof MOBILIDADE_LABIOS_ITEMS)[number]["key"],
    MobilidadeScore | null
  >;
  mobilidadeLingua: Record<
    (typeof MOBILIDADE_LINGUA_ITEMS)[number]["key"],
    MobilidadeScore | null
  >;
  travaLinguas: {
    capasPretas: string;
    reiDeRoma: string;
    chaveChaves: string;
    casaSuja: string;
    comFe: string;
    poemaBaste: string;
    poemaBasteObs: string;
    poemaValeu: string;
    poemaValeuObs: string;
  };
  observacoesGerais: string;
};

function falseMap<T extends readonly { key: string }[]>(
  options: T
): Record<T[number]["key"], boolean> {
  return Object.fromEntries(options.map((item) => [item.key, false])) as Record<
    T[number]["key"],
    boolean
  >;
}

function nullScoreMap<T extends readonly { key: string }[]>(
  options: T
): Record<T[number]["key"], MobilidadeScore | null> {
  return Object.fromEntries(options.map((item) => [item.key, null])) as Record<
    T[number]["key"],
    MobilidadeScore | null
  >;
}

export function createEmptyDiccaoFormData(): DiccaoFormData {
  return {
    articulacao: {
      uiRepeticoesSegundos: "",
      pRepeticoesSegundos: "",
      observacoes: falseMap(ARTICULACAO_OBSERVACAO_OPTIONS),
      outrasObservacoes: "",
    },
    intensidadeVocal: "",
    tempoMaximoFonacao: {
      a: "",
      i: "",
      s: "",
      z: "",
    },
    diadocinesia: falseMap(DIADOCOCINESIA_OPTIONS),
    falaAutomatica: {
      omissao: "",
      substituicao: "",
      distorcao: "",
    },
    mobilidadeLabios: nullScoreMap(MOBILIDADE_LABIOS_ITEMS),
    mobilidadeLingua: nullScoreMap(MOBILIDADE_LINGUA_ITEMS),
    travaLinguas: {
      capasPretas: "",
      reiDeRoma: "",
      chaveChaves: "",
      casaSuja: "",
      comFe: "",
      poemaBaste: "",
      poemaBasteObs: "",
      poemaValeu: "",
      poemaValeuObs: "",
    },
    observacoesGerais: "",
  };
}

export function getMobilidadeLabel(value: MobilidadeScore | null) {
  if (value == null) return "Não informado";
  return MOBILIDADE_SCALE.find((item) => item.value === value)?.label ?? String(value);
}

export function countDiccaoFilledFields(form: DiccaoFormData): number {
  let count = 0;

  if (form.articulacao.uiRepeticoesSegundos.trim()) count += 1;
  if (form.articulacao.pRepeticoesSegundos.trim()) count += 1;
  count += Object.values(form.articulacao.observacoes).filter(Boolean).length;
  if (form.articulacao.outrasObservacoes.trim()) count += 1;

  if (form.intensidadeVocal) count += 1;

  count += Object.values(form.tempoMaximoFonacao).filter((value) => value.trim()).length;
  count += Object.values(form.diadocinesia).filter(Boolean).length;

  if (form.falaAutomatica.omissao.trim()) count += 1;
  if (form.falaAutomatica.substituicao.trim()) count += 1;
  if (form.falaAutomatica.distorcao.trim()) count += 1;

  count += Object.values(form.mobilidadeLabios).filter((value) => value != null).length;
  count += Object.values(form.mobilidadeLingua).filter((value) => value != null).length;

  const trava = form.travaLinguas;
  for (const key of Object.keys(trava) as (keyof typeof trava)[]) {
    if (trava[key].trim()) count += 1;
  }

  if (form.observacoesGerais.trim()) count += 1;

  return count;
}
