import { ABFW_TEMPLATE_NAME } from "@/lib/fono/abfw";
import { AMIOFE_TEMPLATE_NAME } from "@/lib/fono/amiofe";
import { LINGUAGEM_PROC_TEMPLATE_NAME } from "@/lib/fono/linguagem-proc";
import { MBGR_TEMPLATE_NAME } from "@/lib/fono/mbgr";
import { MOTRICIDADE_TEMPLATE_NAME } from "@/lib/fono/motricidade-orofacial";
import { DEMUCA_TEMPLATE_NAME } from "@/lib/demuca";
import { DICCAO_TEMPLATE_NAME } from "@/lib/diccao";
import { EBAI_TEMPLATE_NAME } from "@/lib/ebai";
import { PEDI_TEMPLATE_NAME } from "@/lib/pedi";
import { SENSORY_PROFILE_TEMPLATE_NAME } from "@/lib/sensory-profile";
import type { ClinicalArea } from "@/lib/clinical-areas";
import {
  CLINICAL_AREA_LABELS,
  clinicalAreasIntersect,
  getClinicalAreasForSession,
} from "@/lib/clinical-areas";
import { normalizeRole, ROLES, type Role } from "@/lib/rbac";

/** Hub de aplicação ao paciente (menu Evolução → Avaliações). */
export const ASSESSMENT_APPLY_HUB_HREF = "/dashboard/avaliacoes/aplicar";

export const ASSESSMENT_APPLY_ROUTES: Record<string, string> = {
  [PEDI_TEMPLATE_NAME]: "/dashboard/avaliacoes/pedi",
  [SENSORY_PROFILE_TEMPLATE_NAME]: "/dashboard/avaliacoes/perfil-sensorial",
  [EBAI_TEMPLATE_NAME]: "/dashboard/avaliacoes/ebai",
  [DEMUCA_TEMPLATE_NAME]: "/dashboard/avaliacoes/demuca",
  [DICCAO_TEMPLATE_NAME]: "/dashboard/avaliacoes/diccao",
  [AMIOFE_TEMPLATE_NAME]: "/dashboard/avaliacoes/amiofe",
  [MOTRICIDADE_TEMPLATE_NAME]: "/dashboard/avaliacoes/motricidade-orofacial",
  [LINGUAGEM_PROC_TEMPLATE_NAME]: "/dashboard/avaliacoes/linguagem",
  [ABFW_TEMPLATE_NAME]: "/dashboard/avaliacoes/abfw",
  [MBGR_TEMPLATE_NAME]: "/dashboard/avaliacoes/mbgr",
};

/** Instrumentos com tela de aplicação — usado no hub de atendimento. */
export const APPLICABLE_ASSESSMENTS = [
  {
    name: PEDI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[PEDI_TEMPLATE_NAME],
    buttonLabel: "PEDI",
    description:
      "Pediatric Evaluation of Disability Inventory — funcionalidade e assistência do cuidador.",
    clinicalAreas: ["terapia_ocupacional"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: SENSORY_PROFILE_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[SENSORY_PROFILE_TEMPLATE_NAME],
    buttonLabel: "Perfil Sensorial II",
    description:
      "Avaliação do processamento sensorial em contextos cotidianos.",
    clinicalAreas: ["terapia_ocupacional"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: EBAI_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[EBAI_TEMPLATE_NAME],
    buttonLabel: "EBAI",
    description:
      "Escala Brasileira de Avaliação do Desenvolvimento Infantil.",
    clinicalAreas: ["aba", "psicologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: DEMUCA_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[DEMUCA_TEMPLATE_NAME],
    buttonLabel: "DEMUCA",
    description:
      "Escala de Desenvolvimento Musical da Criança com Autismo (DEMUCA 2.0).",
    clinicalAreas: ["musicoterapia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: DICCAO_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[DICCAO_TEMPLATE_NAME],
    buttonLabel: "Dicção",
    description:
      "Protocolo adaptado de articulação, fonação, diadocinesia e mobilidade orofacial.",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: AMIOFE_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[AMIOFE_TEMPLATE_NAME],
    buttonLabel: "AMIOFE",
    description:
      "Avaliação Miofuncional Orofacial com Escores (aparência, mobilidade e funções).",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: MOTRICIDADE_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[MOTRICIDADE_TEMPLATE_NAME],
    buttonLabel: "Motricidade Orofacial",
    description:
      "Avaliação infantil de órgãos fonoarticulatórios e funções neurovegetativas.",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: LINGUAGEM_PROC_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[LINGUAGEM_PROC_TEMPLATE_NAME],
    buttonLabel: "Linguagem (PROC)",
    description:
      "Observação comportamental de linguagem infantil — PROC / TIPITI.",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: ABFW_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[ABFW_TEMPLATE_NAME],
    buttonLabel: "ABFW Fonologia",
    description:
      "Prova de fonologia — quadro fonético, emissão e recepção.",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    name: MBGR_TEMPLATE_NAME,
    href: ASSESSMENT_APPLY_ROUTES[MBGR_TEMPLATE_NAME],
    buttonLabel: "MBGR Exame",
    description:
      "Exame miofuncional orofacial MBGR (história clínica na anamnese de Fono).",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
] as const;

export type ApplicableAssessment = (typeof APPLICABLE_ASSESSMENTS)[number];

export function getApplicableAssessmentsForSession(input: {
  professionalRole?: string | null;
  profile?: Role | string;
  isMaster?: boolean;
  canManageAll?: boolean;
}) {
  const isCoordinatorWithoutSpecialty =
    input.profile !== undefined &&
    normalizeRole(input.profile) === ROLES.COORDENADOR &&
    (!input.professionalRole || input.professionalRole === "Coordenador");

  const userAreas = getClinicalAreasForSession({
    ...input,
    // Cadastros legados usavam "Coordenador" como cargo, sem informar a
    // especialidade clínica. Nessa situação, o catálogo completo evita que o
    // coordenador fique bloqueado; as rotas continuam protegidas por RBAC.
    canManageAll: input.canManageAll || isCoordinatorWithoutSpecialty,
  });
  return APPLICABLE_ASSESSMENTS.filter((item) =>
    clinicalAreasIntersect([...item.clinicalAreas], userAreas)
  );
}

/** Agrupa instrumentos pela área clínica principal para o hub. */
export function groupAssessmentsByClinicalArea(
  instruments: readonly ApplicableAssessment[]
) {
  const order: ClinicalArea[] = [
    "fonoaudiologia",
    "terapia_ocupacional",
    "fisioterapia",
    "psicologia",
    "aba",
    "musicoterapia",
    "psicopedagogia",
    "nutricao",
    "geral",
  ];

  const groups = new Map<
    ClinicalArea,
    { area: ClinicalArea; label: string; items: ApplicableAssessment[] }
  >();

  for (const item of instruments) {
    const area = item.clinicalAreas[0] ?? "geral";
    const existing = groups.get(area);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(area, {
        area,
        label: CLINICAL_AREA_LABELS[area],
        items: [item],
      });
    }
  }

  return order
    .filter((area) => groups.has(area))
    .map((area) => groups.get(area)!)
    .concat(
      [...groups.values()].filter((group) => !order.includes(group.area))
    );
}

const ASSESSMENT_APPLY_PATHS = new Set([
  ASSESSMENT_APPLY_HUB_HREF,
  ...Object.values(ASSESSMENT_APPLY_ROUTES),
]);

export function getAssessmentApplyRoute(templateName: string): string | null {
  return ASSESSMENT_APPLY_ROUTES[templateName] ?? null;
}

export function hasAssessmentApplyRoute(templateName: string): boolean {
  return templateName in ASSESSMENT_APPLY_ROUTES;
}

/** Rotas de aplicação ao paciente (não confundir com cadastro de templates). */
export function isAssessmentApplyPath(pathname: string): boolean {
  return (
    ASSESSMENT_APPLY_PATHS.has(pathname) ||
    pathname.startsWith(`${ASSESSMENT_APPLY_HUB_HREF}/`)
  );
}
