export const LINGUAGEM_PROC_TEMPLATE_NAME =
  "Linguagem Infantil — PROC / TIPITI";
export const LINGUAGEM_PROC_INSTRUMENT = LINGUAGEM_PROC_TEMPLATE_NAME;

function checkboxMap<T extends string>(
  keys: readonly T[]
): Record<T, boolean> {
  return Object.fromEntries(keys.map((key) => [key, false])) as Record<
    T,
    boolean
  >;
}

export const HABILIDADES_DIALOGICAS = [
  { key: "iniciaConversacao", label: "Inicia a conversação/interação" },
  { key: "aguardaTurno", label: "Aguarda seu turno" },
  { key: "participaAtivamente", label: "Participa ativamente da atividade dialógica" },
] as const;

export const FUNCOES_COMUNICATIVAS = [
  { key: "instrumental", label: "Instrumental" },
  { key: "protesto", label: "Protesto" },
  { key: "interativa", label: "Interativa" },
  { key: "nomeacao", label: "Nomeação" },
  { key: "informativa", label: "Informativa" },
  { key: "heuristica", label: "Heurística" },
  { key: "narrativa", label: "Narrativa" },
] as const;

export const MEIOS_SEM_ORALIDADE = [
  { key: "gestosElementares", label: "Somente gestos não simbólicos elementares" },
  {
    key: "gestosConvencionais",
    label: "Gestos não simbólicos convencionais",
  },
  { key: "gestosSimbolicos", label: "Gestos simbólicos" },
] as const;

export const MEIOS_COM_ORALIDADE = [
  { key: "vocalizacoesNaoArticuladas", label: "Somente vocalizações não articuladas" },
  { key: "jargao", label: "Vocalizações + jargão" },
  { key: "palavrasContextuais", label: "Palavras isoladas contextuais" },
  { key: "palavrasReferenciais", label: "Palavras isoladas referenciais" },
  { key: "frasesTelegraficas", label: "Frases telegráficas (3+ palavras)" },
  { key: "relatoImediato", label: "Relato de experiências imediatas" },
  { key: "relatoNaoImediato", label: "Relato verbal de experiências não imediatas" },
] as const;

export const COMPREENSAO_VERBAL = [
  { key: "semResposta", label: "Não apresenta respostas à linguagem" },
  { key: "assistematica", label: "Responde assistematicamente" },
  { key: "atendeChamado", label: "Atende quando é chamada" },
  { key: "umaAcao", label: "Compreende ordens com uma ação" },
  { key: "duasAcoes", label: "Compreende ordens com até duas ações" },
  {
    key: "tresPresente",
    label: "Compreende 3+ ações no contexto presente",
  },
  {
    key: "tresAusente",
    label: "Compreende 3+ ações referentes a situações ausentes",
  },
] as const;

export const SIMBOLISMO = [
  { key: "sensorioMotor", label: "Somente sensório-motoras" },
  { key: "usoConvencional", label: "Uso convencional dos objetos" },
  { key: "esquemasSimbolicos", label: "Esquemas simbólicos (próprio corpo)" },
  { key: "parceirosBrinquedo", label: "Usa bonecos/parceiros no brinquedo" },
  { key: "sequencia", label: "Organiza ações simbólicas em sequência" },
  { key: "objetosSubstitutos", label: "Objetos substitutos / gestos simbólicos" },
  { key: "linguagemVerbal", label: "Usa linguagem verbal no brinquedo" },
] as const;

export const CARACTERISTICAS_COMUNICATIVAS = [
  { key: "semIntencionalidade", label: "Não apresenta comunicação intencional" },
  {
    key: "primariaNaoVerbal",
    label: "Intencional com funções primárias, meios não verbais",
  },
  {
    key: "plurifuncionalSimbolica",
    label: "Plurifuncional por meios não verbais simbólicos",
  },
  {
    key: "verbalContexto",
    label: "Plurifuncional verbal ligada ao contexto imediato",
  },
  {
    key: "verbalAlem",
    label: "Plurifuncional verbal além do contexto imediato",
  },
] as const;

export type LinguagemProcFormData = {
  habilidadesDialogicas: Record<
    (typeof HABILIDADES_DIALOGICAS)[number]["key"],
    boolean
  >;
  funcoesComunicativas: Record<
    (typeof FUNCOES_COMUNICATIVAS)[number]["key"],
    boolean
  >;
  meiosSemOralidade: Record<(typeof MEIOS_SEM_ORALIDADE)[number]["key"], boolean>;
  meiosComOralidade: Record<(typeof MEIOS_COM_ORALIDADE)[number]["key"], boolean>;
  compreensaoVerbal: Record<(typeof COMPREENSAO_VERBAL)[number]["key"], boolean>;
  simbolismo: Record<(typeof SIMBOLISMO)[number]["key"], boolean>;
  caracteristicasComunicativas: Record<
    (typeof CARACTERISTICAS_COMUNICATIVAS)[number]["key"],
    boolean
  >;
  conceitosBasicos: string;
  narrativaSequencia: string;
  comunicacaoGrafica: string;
  observacoes: string;
};

export function createEmptyLinguagemProcFormData(): LinguagemProcFormData {
  return {
    habilidadesDialogicas: checkboxMap(HABILIDADES_DIALOGICAS.map((o) => o.key)),
    funcoesComunicativas: checkboxMap(FUNCOES_COMUNICATIVAS.map((o) => o.key)),
    meiosSemOralidade: checkboxMap(MEIOS_SEM_ORALIDADE.map((o) => o.key)),
    meiosComOralidade: checkboxMap(MEIOS_COM_ORALIDADE.map((o) => o.key)),
    compreensaoVerbal: checkboxMap(COMPREENSAO_VERBAL.map((o) => o.key)),
    simbolismo: checkboxMap(SIMBOLISMO.map((o) => o.key)),
    caracteristicasComunicativas: checkboxMap(
      CARACTERISTICAS_COMUNICATIVAS.map((o) => o.key)
    ),
    conceitosBasicos: "",
    narrativaSequencia: "",
    comunicacaoGrafica: "",
    observacoes: "",
  };
}

export function countLinguagemProcFilledFields(
  data: LinguagemProcFormData
): number {
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
