import type { ClinicalArea } from "@/lib/clinical-areas";
import {
  clinicalAreasIntersect,
  getClinicalAreasForSession,
} from "@/lib/clinical-areas";

export const ANAMNESIS_TYPE_OPTIONS = [
  {
    value: "fisioterapia",
    label: "Fisioterapia",
    clinicalAreas: ["fisioterapia"] as const satisfies readonly ClinicalArea[],
  },
  {
    value: "terapia_ocupacional",
    label: "Terapia Ocupacional",
    clinicalAreas: [
      "terapia_ocupacional",
    ] as const satisfies readonly ClinicalArea[],
  },
  {
    value: "fonoaudiologia",
    label: "Fonoaudiologia",
    clinicalAreas: ["fonoaudiologia"] as const satisfies readonly ClinicalArea[],
  },
  {
    value: "musicoterapia",
    label: "Musicoterapia",
    clinicalAreas: ["musicoterapia"] as const satisfies readonly ClinicalArea[],
  },
  {
    value: "nutricao",
    label: "Nutrição",
    clinicalAreas: ["nutricao"] as const satisfies readonly ClinicalArea[],
  },
] as const;

export function getAnamnesisTypesForSession(input: {
  professionalRole?: string | null;
  isMaster?: boolean;
  canManageAll?: boolean;
}) {
  const userAreas = getClinicalAreasForSession(input);

  return ANAMNESIS_TYPE_OPTIONS.filter((option) =>
    clinicalAreasIntersect([...option.clinicalAreas], userAreas)
  );
}
