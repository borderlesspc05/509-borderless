import type { ProfessionalRole } from "@/lib/professionals-data";

export const CLINICAL_AREAS = [
  "fisioterapia",
  "fonoaudiologia",
  "psicologia",
  "terapia_ocupacional",
  "musicoterapia",
  "psicopedagogia",
  "aba",
  "geral",
] as const;

export type ClinicalArea = (typeof CLINICAL_AREAS)[number];

export const CLINICAL_AREA_LABELS: Record<ClinicalArea, string> = {
  fisioterapia: "Fisioterapia",
  fonoaudiologia: "Fonoaudiologia",
  psicologia: "Psicologia",
  terapia_ocupacional: "Terapia Ocupacional",
  musicoterapia: "Musicoterapia",
  psicopedagogia: "Psicopedagogia",
  aba: "ABA",
  geral: "Geral / compartilhado",
};

export const clinicalAreaSelectItems = CLINICAL_AREAS.map((value) => ({
  value,
  label: CLINICAL_AREA_LABELS[value],
}));

const ROLE_TO_AREAS: Record<ProfessionalRole, readonly ClinicalArea[]> = {
  Psicólogo: ["psicologia", "geral"],
  "Psicólogo(a)": ["psicologia", "geral"],
  "Assistente Terapêutico (AT)": ["aba", "geral"],
  Coordenador: ["aba", "geral"],
  Fonoaudiólogo: ["fonoaudiologia", "geral"],
  "Terapeuta Ocupacional": ["terapia_ocupacional", "geral"],
  "Supervisor Administrativo": ["geral"],
  Musicoterapeuta: ["musicoterapia", "geral"],
  Neuropsicólogo: ["psicologia", "geral"],
  Psicopedagoga: ["psicopedagogia", "geral"],
  Fisioterapeuta: ["fisioterapia", "geral"],
};

export function isClinicalArea(value: string): value is ClinicalArea {
  return (CLINICAL_AREAS as readonly string[]).includes(value);
}

export function getClinicalAreaLabel(area: string) {
  return isClinicalArea(area) ? CLINICAL_AREA_LABELS[area] : area;
}

export function getClinicalAreasForRole(
  professionalRole: string | null | undefined
): ClinicalArea[] {
  if (!professionalRole) {
    return ["geral"];
  }

  const mapped = ROLE_TO_AREAS[professionalRole as ProfessionalRole];
  if (mapped) {
    return [...mapped];
  }

  return ["geral"];
}

/** MASTER / admin / supervisor sem cargo clínico: acesso a todas as áreas. */
export function getClinicalAreasForSession(input: {
  professionalRole?: string | null;
  isMaster?: boolean;
  canManageAll?: boolean;
}): ClinicalArea[] {
  if (input.isMaster || input.canManageAll) {
    return [...CLINICAL_AREAS];
  }

  return getClinicalAreasForRole(input.professionalRole);
}

export function clinicalAreasIntersect(
  templateAreas: readonly string[] | null | undefined,
  userAreas: readonly ClinicalArea[]
): boolean {
  const areas =
    templateAreas && templateAreas.length > 0 ? templateAreas : ["geral"];

  if (userAreas.includes("geral") && userAreas.length === CLINICAL_AREAS.length) {
    return true;
  }

  return areas.some(
    (area) => area === "geral" || userAreas.includes(area as ClinicalArea)
  );
}

export function normalizeClinicalAreas(
  values: readonly string[] | null | undefined
): ClinicalArea[] {
  if (!values?.length) {
    return ["geral"];
  }

  const filtered = values.filter(isClinicalArea);
  return filtered.length > 0 ? filtered : ["geral"];
}
