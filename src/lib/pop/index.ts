/** Protocolo de Observação Psicomotora (POP). */

export const POP_TEMPLATE_NAME = "POP — Protocolo de Observação Psicomotora";
export const POP_INSTRUMENT = "POP Psicomotora";

export type PopObservationOption = {
  key: string;
  label: string;
};

export type PopDimension = {
  id: string;
  title: string;
  items: readonly PopObservationOption[];
};

export const POP_VINCULO_OPTIONS = [
  { key: "espontaneo", label: "Espontâneo" },
  { key: "com_mediacao", label: "Com mediação" },
  { key: "nao_estabelecido", label: "Não estabelecido" },
] as const;

export const POP_REACOES_OPTIONS = [
  { key: "adequadas", label: "Adequadas" },
  { key: "apreensivas", label: "Apreensivas" },
  { key: "indiferente", label: "Indiferente" },
  { key: "agitado", label: "Agitado" },
] as const;

export const POP_PARTICIPACAO_OPTIONS = [
  { key: "ativa", label: "Ativa" },
  { key: "parcial", label: "Parcial" },
  { key: "passiva", label: "Passiva" },
  { key: "resistencia", label: "Resistência" },
] as const;

export const POP_DIMENSIONS: readonly PopDimension[] = [
  {
    id: "motricidade_global",
    title: "Motricidade global",
    items: [
      { key: "marcha", label: "Marcha" },
      { key: "corrida", label: "Corrida" },
      { key: "saltos", label: "Saltos" },
      { key: "degraus", label: "Degraus" },
      { key: "controle_postural", label: "Controle postural" },
      { key: "equilibrio_dinamico", label: "Equilíbrio dinâmico" },
      { key: "reacao_desequilibrio", label: "Reação ao desequilíbrio" },
    ],
  },
  {
    id: "motricidade_fina",
    title: "Motricidade fina",
    items: [
      { key: "pinca", label: "Pinça" },
      { key: "olho_mao", label: "Coordenação olho-mão" },
      { key: "desenho", label: "Desenho" },
      { key: "tesoura", label: "Uso de tesoura" },
      { key: "blocos", label: "Blocos / puzzle" },
      { key: "ritmo", label: "Ritmo" },
    ],
  },
  {
    id: "esquema_corporal",
    title: "Esquema corporal / lateralidade",
    items: [
      { key: "nomeacao_corpo", label: "Nomeação do corpo" },
      { key: "reconhecimento_outro", label: "Reconhecimento no outro" },
      { key: "imitacao", label: "Imitação" },
      { key: "lateralidade", label: "Lateralidade espontânea" },
      { key: "uso_objetos", label: "Uso de objetos" },
    ],
  },
  {
    id: "organizacao_espaco_tempo",
    title: "Organização espacial / temporal",
    items: [
      { key: "cima_baixo", label: "Cima / baixo / frente / trás" },
      { key: "formas", label: "Formas / tamanhos" },
      { key: "sequencia", label: "Sequência temporal" },
      { key: "comandos", label: "Comandos sequenciais" },
    ],
  },
  {
    id: "coordenacao_praxias",
    title: "Coordenação e praxias",
    items: [
      { key: "praxis_global", label: "Praxis global" },
      { key: "praxis_fina", label: "Praxis fina" },
      { key: "ideomotora", label: "Praxis ideomotora" },
      { key: "construtiva", label: "Praxis construtiva" },
    ],
  },
  {
    id: "regulacao_motor",
    title: "Regulação e controle motor",
    items: [
      { key: "inibicao", label: "Inibição" },
      { key: "forca", label: "Força" },
      { key: "resistencia", label: "Resistência" },
      { key: "velocidade", label: "Velocidade de resposta" },
    ],
  },
  {
    id: "emocional_relacional",
    title: "Emocional / relacional",
    items: [
      { key: "interesse", label: "Interesse" },
      { key: "frustracao", label: "Frustração" },
      { key: "iniciativa", label: "Iniciativa" },
      { key: "interacao", label: "Interação com o avaliador" },
    ],
  },
] as const;

export const POP_ITEM_LEVELS = [
  { value: "", label: "—" },
  { value: "adequado", label: "Adequado" },
  { value: "em_aquisicao", label: "Em aquisição" },
  { value: "dificuldade", label: "Com dificuldade" },
  { value: "nao_observa", label: "Não observado" },
] as const;

export type PopFormData = {
  header: {
    diagnosis: string;
    childAge: string;
  };
  observacaoGeral: {
    comportamentoInicial: string;
    vinculo: string;
    reacoesAmbiente: string;
    participacao: string;
  };
  dimensions: Record<string, Record<string, string>>;
  dimensionNotes: Record<string, string>;
  conclusoes: string;
};

export function createEmptyPopFormData(): PopFormData {
  const dimensions: Record<string, Record<string, string>> = {};
  const dimensionNotes: Record<string, string> = {};

  for (const dimension of POP_DIMENSIONS) {
    dimensions[dimension.id] = Object.fromEntries(
      dimension.items.map((item) => [item.key, ""])
    );
    dimensionNotes[dimension.id] = "";
  }

  return {
    header: { diagnosis: "", childAge: "" },
    observacaoGeral: {
      comportamentoInicial: "",
      vinculo: "",
      reacoesAmbiente: "",
      participacao: "",
    },
    dimensions,
    dimensionNotes,
    conclusoes: "",
  };
}

export function countPopFilled(form: PopFormData) {
  let count = 0;
  if (form.header.diagnosis.trim()) count += 1;
  if (form.header.childAge.trim()) count += 1;
  if (form.observacaoGeral.comportamentoInicial.trim()) count += 1;
  if (form.observacaoGeral.vinculo) count += 1;
  if (form.observacaoGeral.reacoesAmbiente) count += 1;
  if (form.observacaoGeral.participacao) count += 1;
  if (form.conclusoes.trim()) count += 1;

  for (const dimension of POP_DIMENSIONS) {
    const values = form.dimensions[dimension.id] ?? {};
    count += Object.values(values).filter(Boolean).length;
    if (form.dimensionNotes[dimension.id]?.trim()) count += 1;
  }

  return count;
}
