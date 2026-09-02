import type { ProfessionalRole } from "@/lib/professionals-data";
import type { ClinicalArea } from "@/lib/clinical-areas";

/**
 * Aliases de cargo (gênero, abreviações e variações de cadastro)
 * → papel canônico usado em ROLE_TO_AREAS.
 */
const ROLE_ALIASES: Record<string, ProfessionalRole> = {
  psicólogo: "Psicólogo",
  "psicólogo(a)": "Psicólogo(a)",
  psicologa: "Psicólogo(a)",
  psicóloga: "Psicólogo(a)",
  "assistente terapêutico (at)": "Assistente Terapêutico (AT)",
  "assistente terapeutico (at)": "Assistente Terapêutico (AT)",
  at: "Assistente Terapêutico (AT)",
  coordenador: "Coordenador",
  coordenadora: "Coordenador",
  fonoaudiólogo: "Fonoaudiólogo",
  fonoaudiologa: "Fonoaudiólogo",
  fonoaudióloga: "Fonoaudiólogo",
  fono: "Fonoaudiólogo",
  "terapeuta ocupacional": "Terapeuta Ocupacional",
  to: "Terapeuta Ocupacional",
  "supervisor administrativo": "Supervisor Administrativo",
  musicoterapeuta: "Musicoterapeuta",
  neuropsicólogo: "Neuropsicólogo",
  neuropsicologa: "Neuropsicólogo",
  neuropsicóloga: "Neuropsicólogo",
  psicopedagoga: "Psicopedagoga",
  psicopedagogo: "Psicopedagoga",
  fisioterapeuta: "Fisioterapeuta",
  nutricionista: "Nutricionista",
};

export function normalizeProfessionalRole(
  professionalRole: string | null | undefined
): ProfessionalRole | null {
  if (!professionalRole?.trim()) {
    return null;
  }

  const trimmed = professionalRole.trim();
  const fromAlias = ROLE_ALIASES[trimmed.toLowerCase()];
  if (fromAlias) {
    return fromAlias;
  }

  return trimmed as ProfessionalRole;
}

export function resolveClinicalAreasFromRoleLabel(
  professionalRole: string | null | undefined,
  roleMap: Record<ProfessionalRole, readonly ClinicalArea[]>
): ClinicalArea[] | null {
  const normalized = normalizeProfessionalRole(professionalRole);
  if (!normalized) {
    return null;
  }

  const mapped = roleMap[normalized];
  return mapped ? [...mapped] : null;
}
