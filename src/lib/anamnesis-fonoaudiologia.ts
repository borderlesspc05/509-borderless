/** Anamnese de Fonoaudiologia — baseada na História Clínica MBGR. */

function checkboxMap<T extends string>(
  keys: readonly T[]
): Record<T, boolean> {
  return Object.fromEntries(keys.map((key) => [key, false])) as Record<
    T,
    boolean
  >;
}

export const FONO_QUEIXAS_OPTIONS = [
  { key: "labios", label: "Lábios" },
  { key: "lingua", label: "Língua" },
  { key: "succao", label: "Sucção" },
  { key: "mastigacao", label: "Mastigação" },
  { key: "degluticao", label: "Deglutição" },
  { key: "respiracao", label: "Respiração" },
  { key: "fala", label: "Fala" },
  { key: "frenulo", label: "Frênulo lingual" },
  { key: "voz", label: "Voz" },
  { key: "audicao", label: "Audição" },
  { key: "aprendizagem", label: "Aprendizagem" },
  { key: "esteticaFacial", label: "Estética facial" },
  { key: "postura", label: "Postura" },
  { key: "oclusao", label: "Oclusão" },
  { key: "atm", label: "Dor/ruído na ATM" },
] as const;

export const FONO_SONO_OPTIONS = [
  { key: "agitado", label: "Agitado" },
  { key: "fragmentado", label: "Fragmentado" },
  { key: "ronco", label: "Ronco" },
  { key: "sialorreia", label: "Sialorréia (baba)" },
  { key: "apneia", label: "Apneia" },
  { key: "bocaAberta", label: "Boca aberta ao dormir" },
  { key: "bocaSeca", label: "Boca seca ao acordar" },
] as const;

export const FONO_HABITOS_ORAIS = [
  { key: "chupeta", label: "Chupeta" },
  { key: "succaoDigital", label: "Sucção digital" },
  { key: "succaoLingua", label: "Sucção de língua" },
  { key: "bruxismo", label: "Bruxismo" },
  { key: "apertamento", label: "Apertamento dentário" },
  { key: "onicofagia", label: "Onicofagia" },
  { key: "morderObjetos", label: "Morder objetos" },
] as const;

export const FONO_COMUNICACAO_OPTIONS = [
  { key: "intencionalidadePrejudicada", label: "Intencionalidade prejudicada" },
  { key: "ausenciaSonsBebe", label: "Ausência de produção de sons quando bebê" },
  { key: "demorouFalar", label: "Demorou a falar" },
  { key: "demorouFrases", label: "Demorou a elaborar frases" },
  { key: "dificuldadeCompreensao", label: "Dificuldade de compreensão" },
] as const;

export const FONO_FALA_OPTIONS = [
  { key: "omissao", label: "Omissão" },
  { key: "substituicao", label: "Substituição" },
  { key: "inteligibilidade", label: "Inteligibilidade prejudicada" },
  { key: "interposicaoLingua", label: "Interposição de língua" },
] as const;

export type AnamnesisFonoFormData = {
  queixaPrincipal: string;
  outrasQueixas: Record<(typeof FONO_QUEIXAS_OPTIONS)[number]["key"], boolean>;
  antecedentesFamiliares: string;
  gestacao: string;
  nascimento: string;
  desenvolvimentoMotor: string;
  problemasSaude: string;
  problemasRespiratorios: string;
  sono: Record<(typeof FONO_SONO_OPTIONS)[number]["key"], boolean>;
  amamentacao: string;
  alimentacaoAtual: string;
  habitosOrais: Record<(typeof FONO_HABITOS_ORAIS)[number]["key"], boolean>;
  comunicacao: Record<(typeof FONO_COMUNICACAO_OPTIONS)[number]["key"], boolean>;
  fala: Record<(typeof FONO_FALA_OPTIONS)[number]["key"], boolean>;
  audicao: string;
  voz: string;
  escolaridade: string;
  tratamentosAnteriores: string;
  observacoes: string;
};

export function createEmptyAnamnesisFonoFormData(): AnamnesisFonoFormData {
  return {
    queixaPrincipal: "",
    outrasQueixas: checkboxMap(FONO_QUEIXAS_OPTIONS.map((o) => o.key)),
    antecedentesFamiliares: "",
    gestacao: "",
    nascimento: "",
    desenvolvimentoMotor: "",
    problemasSaude: "",
    problemasRespiratorios: "",
    sono: checkboxMap(FONO_SONO_OPTIONS.map((o) => o.key)),
    amamentacao: "",
    alimentacaoAtual: "",
    habitosOrais: checkboxMap(FONO_HABITOS_ORAIS.map((o) => o.key)),
    comunicacao: checkboxMap(FONO_COMUNICACAO_OPTIONS.map((o) => o.key)),
    fala: checkboxMap(FONO_FALA_OPTIONS.map((o) => o.key)),
    audicao: "",
    voz: "",
    escolaridade: "",
    tratamentosAnteriores: "",
    observacoes: "",
  };
}
