import type { SkillDomain } from "@/lib/psychology/skill-checklists";

export const DESFRALDE_TEMPLATE_NAME = "Protocolo de Desfralde";
export const DESFRALDE_INSTRUMENT = "Protocolo de Desfralde";

export const SINAIS_ANTECEDENTES_TEMPLATE_NAME =
  "Sinais Antecedentes e Gatilhos";
export const SINAIS_ANTECEDENTES_INSTRUMENT = "Sinais Antecedentes e Gatilhos";

export {
  SKILL_SCORE_OPTIONS,
  countSkillScores,
  createEmptySkillChecklistForm,
  sumSkillScores,
  type SkillChecklistForm,
  type SkillDomain,
} from "@/lib/psychology/skill-checklists";

/** Protocolo clínico de observação do processo de desfralde (TO). */
export const DESFRALDE_DOMAINS: readonly SkillDomain[] = [
  {
    id: "consciencia",
    title: "Consciência e comunicação da necessidade",
    items: [
      { id: "d_aware", label: "Demonstra consciência de estar molhado/sujo" },
      { id: "d_signal", label: "Sinaliza necessidade de ir ao banheiro" },
      { id: "d_request", label: "Pede para usar o banheiro (verbal ou gestual)" },
      { id: "d_schedule", label: "Aceita idas programadas ao banheiro" },
      { id: "d_hold", label: "Consegue segurar por curtos períodos" },
    ],
  },
  {
    id: "habilidades",
    title: "Habilidades de banheiro e vestuário",
    items: [
      { id: "d_sit", label: "Senta e permanece no vaso/trono" },
      { id: "d_pants", label: "Abaixa/levanta calça ou fralda com apoio" },
      { id: "d_wipe", label: "Participa da higiene após eliminar" },
      { id: "d_flush", label: "Dá descarga / segue rotina de fechamento" },
      { id: "d_hands", label: "Lava as mãos após o banheiro" },
    ],
  },
  {
    id: "controle",
    title: "Controle esfincteriano e acidentes",
    items: [
      { id: "d_dry_day", label: "Permanece seco em períodos diurnos" },
      { id: "d_urine", label: "Elimina urina no vaso com sucesso" },
      { id: "d_stool", label: "Elimina fezes no vaso com sucesso" },
      { id: "d_accident", label: "Redução de acidentes ao longo da semana" },
      { id: "d_night", label: "Sinais de controle noturno (se aplicável)" },
    ],
  },
  {
    id: "contexto",
    title: "Contexto sensorial, motivação e família",
    items: [
      { id: "d_sensory", label: "Tolera sensações do banheiro (som, assento, papel)" },
      { id: "d_fear", label: "Apresenta medo/recusa intensa ao banheiro" },
      { id: "d_motivation", label: "Responde a reforçadores/rotina motivacional" },
      { id: "d_family", label: "Família mantém consistência da rotina" },
      { id: "d_school", label: "Generaliza para escola/outros ambientes" },
    ],
  },
];

/** Observação de sinais antecedentes e gatilhos comportamentais (TO / multidisciplinar). */
export const SINAIS_ANTECEDENTES_DOMAINS: readonly SkillDomain[] = [
  {
    id: "ambientais",
    title: "Gatilhos ambientais e de rotina",
    items: [
      { id: "s_noise", label: "Ruídos altos ou imprevisíveis" },
      { id: "s_crowd", label: "Ambientes cheios / muita estimulação visual" },
      { id: "s_transition", label: "Transições de atividade ou ambiente" },
      { id: "s_wait", label: "Espera prolongada / fila" },
      { id: "s_demand", label: "Demandas novas ou de maior complexidade" },
    ],
  },
  {
    id: "sensoriais",
    title: "Sinais sensoriais precoces",
    items: [
      { id: "s_cover", label: "Tapa orelhas / evita contato visual" },
      { id: "s_seek", label: "Busca intensa de movimento ou pressão" },
      { id: "s_avoid", label: "Evita texturas, luzes ou proximidade física" },
      { id: "s_restless", label: "Inquietação motora crescente" },
      { id: "s_freeze", label: "Congelamento ou retração social" },
    ],
  },
  {
    id: "emocionais",
    title: "Sinais emocionais e comunicativos",
    items: [
      { id: "s_tone", label: "Mudança de tom de voz ou volume" },
      { id: "s_face", label: "Expressão facial de desconforto" },
      { id: "s_help", label: "Pede ajuda / busca adulto de referência" },
      { id: "s_escape", label: "Tentativa de sair / escapar da situação" },
      { id: "s_protest", label: "Protesto verbal ou gestual antes da crise" },
    ],
  },
  {
    id: "funcionais",
    title: "Função provável e estratégias preventivas",
    items: [
      { id: "s_escape_fn", label: "Função de fuga/esquiva identificada" },
      { id: "s_attention_fn", label: "Função de atenção identificada" },
      { id: "s_tangible_fn", label: "Função de acesso a item/atividade" },
      { id: "s_sensory_fn", label: "Função sensorial / autorregulação" },
      { id: "s_strategy", label: "Estratégia preventiva já eficaz no setting" },
    ],
  },
];
