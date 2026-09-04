/** Campos e opções da Anamnese de Terapia Ocupacional (modelo 2026). */

export const TO_DESENVOLVIMENTO_OPTIONS = [
  { key: "controleCervical", label: "Controle cervical" },
  { key: "rolou", label: "Rolou" },
  { key: "arrastou", label: "Arrastou" },
  { key: "segurouObjetos", label: "Segurou objetos" },
  { key: "sentouSemApoio", label: "Sentou — controle de tronco sem apoio" },
  { key: "engatinhou", label: "Engatinhou" },
  { key: "andouSemApoio", label: "Andou sem apoio" },
  { key: "explorarBoca", label: "Explorar objetos com a boca" },
  { key: "falou", label: "Falou" },
] as const;

export const TO_MUSCULO_ESQUELETICO_OPTIONS = [
  { key: "forca", label: "Força" },
  { key: "controlePostural", label: "Controle postural" },
  { key: "tonusMuscular", label: "Tônus muscular" },
  { key: "alinhamentoPostural", label: "Alinhamento postural" },
  { key: "adm", label: "ADM" },
  { key: "controleMotorPraxia", label: "Controle motor / praxia" },
  {
    key: "escorregaCadeira",
    label: "Escorrega da cadeira ou se debruça sobre a mesa/chão",
  },
] as const;

export const TO_COMPONENTES_MOTORES_OPTIONS = [
  { key: "trocarObjetoDeMao", label: "Trocar objeto de mão" },
  { key: "arremessaBola", label: "Arremessa bola ou objetos" },
  { key: "pegaSoltaAtivamente", label: "Pega e solta ativamente objetos" },
  { key: "integracaoBilateral", label: "Integração bilateral" },
  {
    key: "integracaoVisomotora",
    label: "Integração visomotora (escrever, desenhar, pegar bola, amarrar)",
  },
  { key: "coordenacaoMotoraFina", label: "Coordenação motora fina / destreza" },
  { key: "coordenacaoAmplia", label: "Coordenação ampla" },
  { key: "planejamentoMotor", label: "Planejamento motor" },
] as const;

export const TO_COGNITIVO_SOCIAL_OPTIONS = [
  { key: "planejamentoOrganizacao", label: "Planejamento e organização" },
  { key: "linguagem", label: "Linguagem" },
  { key: "atencaoConcentracao", label: "Atenção e concentração" },
  { key: "orientacaoTempoEspaco", label: "Orientação temporal e espacial" },
  { key: "reconhecimento", label: "Reconhecimento" },
  { key: "inicioTermino", label: "Início e término da atividade" },
  { key: "memoria", label: "Memória" },
  { key: "sequenciamento", label: "Sequenciamento" },
  { key: "resolucaoProblemas", label: "Resolução de problemas" },
  { key: "aprendizado", label: "Aprendizado" },
  { key: "condutaSocial", label: "Conduta social" },
  { key: "lidarComFatos", label: "Capacidade para lidar com fatos" },
  { key: "autoexpressao", label: "Autoexpressão" },
  { key: "valores", label: "Valores" },
  { key: "interessesAdequados", label: "Interesses adequados para a idade" },
] as const;

type KeyOf<T extends readonly { key: string }[]> = T[number]["key"];

function emptyBoolRecord<T extends readonly { key: string }[]>(
  options: T
): Record<KeyOf<T>, boolean> {
  return Object.fromEntries(options.map((option) => [option.key, false])) as Record<
    KeyOf<T>,
    boolean
  >;
}

export type AnamnesisTerapiaOcupacionalFormData = {
  queixaPrincipal: string;
  medicamentos: string;
  historiaPregressa: string;
  alergias: string;
  desenvolvimento: Record<KeyOf<typeof TO_DESENVOLVIMENTO_OPTIONS>, boolean>;
  observacoesDesenvolvimento: string;
  sono: {
    dificuldades: string;
    bebeAgitado: boolean;
    choravaMuito: boolean;
    excessivamentePassivo: boolean;
  };
  observacoesSono: string;
  alimentacaoInfo: {
    idadeIntroducao: string;
    comoOfertava: string;
    engasgava: string;
  };
  desfralde: string;
  alteracaoMusculoEsqueletica: Record<
    KeyOf<typeof TO_MUSCULO_ESQUELETICO_OPTIONS>,
    boolean
  >;
  observacoesMusculoEsqueletico: string;
  componentesMotores: Record<
    KeyOf<typeof TO_COMPONENTES_MOTORES_OPTIONS>,
    boolean
  >;
  dominancia: string;
  observacoesMotores: string;
  cognitivoSocial: Record<KeyOf<typeof TO_COGNITIVO_SOCIAL_OPTIONS>, boolean>;
  observacoesCognitivoSocial: string;
  escola: string;
  higiene: string;
  banho: string;
  vestuario: string;
  alimentacao: string;
  rotina: string;
  objetivosFamilia: string;
};

export function createEmptyAnamnesisTerapiaOcupacionalForm(): AnamnesisTerapiaOcupacionalFormData {
  return {
    queixaPrincipal: "",
    medicamentos: "",
    historiaPregressa: "",
    alergias: "",
    desenvolvimento: emptyBoolRecord(TO_DESENVOLVIMENTO_OPTIONS),
    observacoesDesenvolvimento: "",
    sono: {
      dificuldades: "",
      bebeAgitado: false,
      choravaMuito: false,
      excessivamentePassivo: false,
    },
    observacoesSono: "",
    alimentacaoInfo: {
      idadeIntroducao: "",
      comoOfertava: "",
      engasgava: "",
    },
    desfralde: "",
    alteracaoMusculoEsqueletica: emptyBoolRecord(TO_MUSCULO_ESQUELETICO_OPTIONS),
    observacoesMusculoEsqueletico: "",
    componentesMotores: emptyBoolRecord(TO_COMPONENTES_MOTORES_OPTIONS),
    dominancia: "",
    observacoesMotores: "",
    cognitivoSocial: emptyBoolRecord(TO_COGNITIVO_SOCIAL_OPTIONS),
    observacoesCognitivoSocial: "",
    escola: "",
    higiene: "",
    banho: "",
    vestuario: "",
    alimentacao: "",
    rotina: "",
    objetivosFamilia: "",
  };
}
