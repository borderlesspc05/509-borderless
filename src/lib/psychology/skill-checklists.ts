export const AFLS_TEMPLATE_NAME = "AFLS";
export const AFLS_INSTRUMENT = "AFLS";

export const ABLLS_TEMPLATE_NAME = "ABLLS-R";
export const ABLLS_INSTRUMENT = "ABLLS-R";

export const SKILL_SCORE_OPTIONS = [
  { value: "0", label: "0 — Não adquirido" },
  { value: "1", label: "1 — Emergente" },
  { value: "2", label: "2 — Adquirido" },
] as const;

export type SkillDomain = {
  id: string;
  title: string;
  items: readonly { id: string; label: string }[];
};

export type SkillChecklistForm = {
  notes: string;
  scores: Record<string, string>;
};

export function createEmptySkillChecklistForm(): SkillChecklistForm {
  return { notes: "", scores: {} };
}

export function countSkillScores(form: SkillChecklistForm) {
  return Object.values(form.scores).filter((value) => value !== "").length;
}

export function sumSkillScores(form: SkillChecklistForm) {
  return Object.values(form.scores).reduce((total, value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? total + numeric : total;
  }, 0);
}

export const AFLS_DOMAINS: readonly SkillDomain[] = [
  {
    id: "basic",
    title: "Habilidades básicas de vida",
    items: [
      { id: "basic_hygiene", label: "Higiene pessoal com apoio mínimo" },
      { id: "basic_dressing", label: "Vestir-se de forma independente" },
      { id: "basic_feeding", label: "Alimentar-se com utensílios" },
      { id: "basic_toilet", label: "Uso do banheiro" },
      { id: "basic_safety", label: "Segue regras básicas de segurança" },
    ],
  },
  {
    id: "home",
    title: "Habilidades domésticas",
    items: [
      { id: "home_meals", label: "Ajuda no preparo de refeições simples" },
      { id: "home_clean", label: "Organiza e limpa o ambiente" },
      { id: "home_laundry", label: "Participa da lavagem de roupas" },
      { id: "home_chores", label: "Cumpre rotinas domésticas" },
      { id: "home_materials", label: "Cuida de materiais pessoais" },
    ],
  },
  {
    id: "community",
    title: "Participação na comunidade",
    items: [
      { id: "comm_street", label: "Desloca-se com segurança na rua" },
      { id: "comm_store", label: "Compra itens simples em loja" },
      { id: "comm_money", label: "Usa dinheiro ou cartão com apoio" },
      { id: "comm_wait", label: "Aguarda a vez em filas e serviços" },
      { id: "comm_help", label: "Pede ajuda a adultos na comunidade" },
    ],
  },
  {
    id: "school",
    title: "Habilidades escolares",
    items: [
      { id: "school_routine", label: "Segue a rotina da sala" },
      { id: "school_materials", label: "Usa materiais escolares" },
      { id: "school_group", label: "Participa de atividades em grupo" },
      { id: "school_instructions", label: "Segue instruções do professor" },
      { id: "school_transition", label: "Transita entre atividades" },
    ],
  },
  {
    id: "independent",
    title: "Vida independente",
    items: [
      { id: "ind_schedule", label: "Organiza a própria rotina" },
      { id: "ind_health", label: "Comunica necessidades de saúde" },
      { id: "ind_leisure", label: "Escolhe atividades de lazer" },
      { id: "ind_tech", label: "Usa tecnologia funcionalmente" },
      { id: "ind_problem", label: "Resolve problemas cotidianos simples" },
    ],
  },
  {
    id: "vocational",
    title: "Habilidades vocacionais",
    items: [
      { id: "voc_task", label: "Completa tarefas com início, meio e fim" },
      { id: "voc_time", label: "Permanece na tarefa pelo tempo combinado" },
      { id: "voc_peer", label: "Trabalha ao lado de pares" },
      { id: "voc_feedback", label: "Aceita correção e feedback" },
      { id: "voc_materials", label: "Organiza materiais de trabalho" },
    ],
  },
];

export const ABLLS_DOMAINS: readonly SkillDomain[] = [
  {
    id: "cooperation",
    title: "Cooperação e desempenho do ouvinte",
    items: [
      { id: "coop_sit", label: "Senta e permanece na atividade" },
      { id: "coop_look", label: "Olha para o terapeuta quando chamado" },
      { id: "coop_wait", label: "Aguarda instrução" },
      { id: "coop_follow", label: "Segue instruções simples" },
      { id: "coop_transition", label: "Aceita troca de atividade" },
    ],
  },
  {
    id: "visual",
    title: "Desempenho visual",
    items: [
      { id: "vis_match", label: "Emparelha objetos iguais" },
      { id: "vis_sort", label: "Classifica por cor, forma ou categoria" },
      { id: "vis_puzzle", label: "Completa encaixes e quebra-cabeças" },
      { id: "vis_sequence", label: "Ordena sequências visuais" },
      { id: "vis_scan", label: "Varre visualmente um conjunto de itens" },
    ],
  },
  {
    id: "receptive",
    title: "Linguagem receptiva",
    items: [
      { id: "rec_objects", label: "Identifica objetos nomeados" },
      { id: "rec_actions", label: "Identifica ações" },
      { id: "rec_body", label: "Identifica partes do corpo" },
      { id: "rec_features", label: "Seleciona por função ou característica" },
      { id: "rec_two_step", label: "Segue instruções de dois passos" },
    ],
  },
  {
    id: "imitation",
    title: "Imitação motora e vocal",
    items: [
      { id: "imi_gross", label: "Imita movimentos globais" },
      { id: "imi_fine", label: "Imita movimentos finos" },
      { id: "imi_with_object", label: "Imita ações com objetos" },
      { id: "imi_sounds", label: "Imita sons e sílabas" },
      { id: "imi_words", label: "Imita palavras" },
    ],
  },
  {
    id: "mands",
    title: "Pedidos (mandos)",
    items: [
      { id: "mand_want", label: "Pede itens desejados" },
      { id: "mand_help", label: "Pede ajuda" },
      { id: "mand_break", label: "Pede pausa" },
      { id: "mand_info", label: "Pede informação" },
      { id: "mand_absent", label: "Pede item ausente" },
    ],
  },
  {
    id: "tacts",
    title: "Tatos e intraverbais",
    items: [
      { id: "tact_objects", label: "Nomeia objetos" },
      { id: "tact_actions", label: "Nomeia ações" },
      { id: "tact_pictures", label: "Nomeia figuras" },
      { id: "intra_fill", label: "Completa frases familiares" },
      { id: "intra_wh", label: "Responde perguntas simples (quem/o quê)" },
    ],
  },
  {
    id: "academic",
    title: "Habilidades acadêmicas",
    items: [
      { id: "acad_letters", label: "Identifica letras" },
      { id: "acad_numbers", label: "Identifica números" },
      { id: "acad_count", label: "Conta com correspondência um a um" },
      { id: "acad_write", label: "Copia traços ou letras" },
      { id: "acad_read", label: "Lê palavras familiares" },
    ],
  },
  {
    id: "selfcare_social",
    title: "Autocuidado e habilidades sociais",
    items: [
      { id: "self_hygiene", label: "Rotinas de autocuidado" },
      { id: "soc_greet", label: "Cumprimenta pares e adultos" },
      { id: "soc_share", label: "Compartilha materiais" },
      { id: "soc_play", label: "Brinca de forma cooperativa" },
      { id: "soc_turn", label: "Espera a vez em jogos" },
    ],
  },
];
