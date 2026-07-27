export const PROFESSIONAL_ROLES = [
  "Psicólogo",
  "Psicólogo(a)",
  "Assistente Terapêutico (AT)",
  "Coordenador",
  "Fonoaudiólogo",
  "Terapeuta Ocupacional",
  "Supervisor Administrativo",
  "Musicoterapeuta",
  "Neuropsicólogo",
  "Psicopedagoga",
  "Fisioterapeuta",
] as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];
