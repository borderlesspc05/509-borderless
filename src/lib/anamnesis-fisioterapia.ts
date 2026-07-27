export const DESENVOLVIMENTO_MOTOR_OPTIONS = [
  { key: "rolou", label: "Rolou" },
  { key: "arrastou", label: "Arrastou" },
  { key: "segurouObjetos", label: "Segurou objetos" },
  { key: "sentou", label: "Sentou" },
  { key: "engatinhou", label: "Engatinhou" },
  { key: "andou", label: "Andou" },
] as const;

export const ALTERACAO_MUSCULOESQUELETICA_OPTIONS = [
  { key: "forca", label: "Força" },
  { key: "controlePostural", label: "Controle postural" },
  { key: "tonusMuscular", label: "Tônus muscular" },
  { key: "alinhamentoPostural", label: "Alinhamento postural" },
  { key: "adm", label: "ADM" },
  { key: "controleMotorPraxia", label: "Controle motor / praxia" },
  { key: "equilibrioDinamico", label: "Equilíbrio dinâmico" },
  { key: "equilibrioEstatico", label: "Equilíbrio estático" },
] as const;

export const COMPONENTES_MOTORES_OPTIONS = [
  { key: "trocarObjetoDeMao", label: "Trocar objeto de mão" },
  { key: "arremessaBola", label: "Arremessa bola ou objetos" },
  { key: "pegaSoltaAtivamente", label: "Pega e solta ativamente objetos" },
  { key: "integracaoBilateral", label: "Integração bilateral" },
  { key: "coordenacaoMotoraFina", label: "Coordenação motora fina / destreza" },
  { key: "coordenacaoAmplia", label: "Coordenação ampla" },
  { key: "planejamentoMotor", label: "Planejamento motor" },
] as const;

export const COMPORTAMENTO_OPTIONS = [
  { key: "agressivo", label: "Agressivo" },
  { key: "passivo", label: "Passivo" },
  { key: "indiferente", label: "Indiferente às situações" },
  { key: "autoAgressao", label: "Autoagressão" },
  { key: "heteroAgressao", label: "Heteroagressão" },
] as const;

export const AVD_NIVEL_OPTIONS = [
  { value: "", label: "Não informado" },
  { value: "dependente", label: "Dependente" },
  { value: "semi_dependente", label: "Semi dependente" },
  { value: "independente", label: "Independente" },
] as const;

export const QUALIDADE_OPTIONS = [
  { value: "", label: "Não informado" },
  { value: "boa", label: "Boa" },
  { value: "prejudicada", label: "Prejudicada" },
] as const;

export type AnamnesisFisioterapiaFormData = {
  diagnosticoQueixaPrincipal: string;
  queixaFuncional: string;
  medicamentos: string;
  saude: {
    historiaPregressa: string;
    idadeGestacional: string;
    peso: string;
    altaJuntoDaMae: string;
  };
  desenvolvimento: Record<(typeof DESENVOLVIMENTO_MOTOR_OPTIONS)[number]["key"], boolean>;
  alteracaoMusculoEsqueletica: Record<
    (typeof ALTERACAO_MUSCULOESQUELETICA_OPTIONS)[number]["key"],
    boolean
  >;
  componentesMotores: Record<(typeof COMPONENTES_MOTORES_OPTIONS)[number]["key"], boolean>;
  dominancia: string;
  escola: {
    nome: string;
    serie: string;
    contraturno: string;
    queixas: string;
    atendenteOuCuidador: string;
    materialAdaptado: string;
  };
  compreensao: string;
  imitacaoMotora: string;
  comportamento: Record<(typeof COMPORTAMENTO_OPTIONS)[number]["key"], boolean>;
  avd: {
    higiene: {
      nivel: string;
      controleEsfincter: boolean;
      pedeBanheiro: boolean;
    };
    banho: {
      nivel: string;
      postura: string;
    };
    higieneBucal: {
      nivel: string;
      seguraEscova: boolean;
      escovaDentes: boolean;
    };
    pentearCabelo: {
      nivel: string;
      levaPente: boolean;
      desembaraça: boolean;
      amarra: boolean;
    };
    vestuario: {
      nivel: string;
      vesteSozinho: boolean;
      despeSozinho: boolean;
    };
    alimentacao: {
      nivel: string;
    };
  };
  rotina: {
    geral: string;
    acordar: string;
    brincarTv: string;
    sono: string;
    tempoTelas: string;
    brincar: string;
  };
  objetivosFamilia: string;
  objetivosFuncionais: string;
};

function falseMap<T extends readonly { key: string }[]>(
  options: T
): Record<T[number]["key"], boolean> {
  return Object.fromEntries(options.map((item) => [item.key, false])) as Record<
    T[number]["key"],
    boolean
  >;
}

export function createEmptyAnamnesisFisioterapiaFormData(): AnamnesisFisioterapiaFormData {
  return {
    diagnosticoQueixaPrincipal: "",
    queixaFuncional: "",
    medicamentos: "",
    saude: {
      historiaPregressa: "",
      idadeGestacional: "",
      peso: "",
      altaJuntoDaMae: "",
    },
    desenvolvimento: falseMap(DESENVOLVIMENTO_MOTOR_OPTIONS),
    alteracaoMusculoEsqueletica: falseMap(ALTERACAO_MUSCULOESQUELETICA_OPTIONS),
    componentesMotores: falseMap(COMPONENTES_MOTORES_OPTIONS),
    dominancia: "",
    escola: {
      nome: "",
      serie: "",
      contraturno: "",
      queixas: "",
      atendenteOuCuidador: "",
      materialAdaptado: "",
    },
    compreensao: "",
    imitacaoMotora: "",
    comportamento: falseMap(COMPORTAMENTO_OPTIONS),
    avd: {
      higiene: {
        nivel: "",
        controleEsfincter: false,
        pedeBanheiro: false,
      },
      banho: {
        nivel: "",
        postura: "",
      },
      higieneBucal: {
        nivel: "",
        seguraEscova: false,
        escovaDentes: false,
      },
      pentearCabelo: {
        nivel: "",
        levaPente: false,
        desembaraça: false,
        amarra: false,
      },
      vestuario: {
        nivel: "",
        vesteSozinho: false,
        despeSozinho: false,
      },
      alimentacao: {
        nivel: "",
      },
    },
    rotina: {
      geral: "",
      acordar: "",
      brincarTv: "",
      sono: "",
      tempoTelas: "",
      brincar: "",
    },
    objetivosFamilia: "",
    objetivosFuncionais: "",
  };
}

export function getAvdNivelLabel(value: string) {
  return AVD_NIVEL_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function getQualidadeLabel(value: string) {
  return QUALIDADE_OPTIONS.find((item) => item.value === value)?.label ?? value;
}
