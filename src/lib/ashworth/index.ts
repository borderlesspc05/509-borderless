/** Escala Modificada de Ashworth (EAM) — tônus / espasticidade. */

export const ASHWORTH_TEMPLATE_NAME = "Escala de Ashworth Modificada";
export const ASHWORTH_INSTRUMENT = "Ashworth Modificada";

export const ASHWORTH_GRADES = [
  {
    value: "0",
    label: "0",
    description: "Tônus muscular normal",
  },
  {
    value: "1",
    label: "1",
    description:
      "Leve aumento do tônus muscular, com mínima resistência ao final da amplitude de movimento",
  },
  {
    value: "1+",
    label: "1+",
    description:
      "Leve aumento do tônus muscular, com mínima resistência em menos da metade da amplitude de movimento",
  },
  {
    value: "2",
    label: "2",
    description:
      "Aumento mais marcado do tônus na maior parte da amplitude; mobilização ainda fácil",
  },
  {
    value: "3",
    label: "3",
    description:
      "Considerável aumento do tônus muscular; movimento passivo difícil",
  },
  {
    value: "4",
    label: "4",
    description: "Segmento rígido em flexão ou extensão",
  },
] as const;

export type AshworthGrade = (typeof ASHWORTH_GRADES)[number]["value"] | "";

export const ASHWORTH_SEGMENTS = [
  { id: "ombro_d", label: "Ombro direito" },
  { id: "ombro_e", label: "Ombro esquerdo" },
  { id: "cotovelo_d", label: "Cotovelo direito" },
  { id: "cotovelo_e", label: "Cotovelo esquerdo" },
  { id: "punho_d", label: "Punho direito" },
  { id: "punho_e", label: "Punho esquerdo" },
  { id: "quadril_d", label: "Quadril direito" },
  { id: "quadril_e", label: "Quadril esquerdo" },
  { id: "joelho_d", label: "Joelho direito" },
  { id: "joelho_e", label: "Joelho esquerdo" },
  { id: "tornozelo_d", label: "Tornozelo direito" },
  { id: "tornozelo_e", label: "Tornozelo esquerdo" },
] as const;

export type AshworthFormData = {
  grades: Record<string, AshworthGrade>;
  notes: string;
};

export function createEmptyAshworthFormData(): AshworthFormData {
  return {
    grades: Object.fromEntries(
      ASHWORTH_SEGMENTS.map((segment) => [segment.id, "" as AshworthGrade])
    ),
    notes: "",
  };
}

export function countAshworthFilled(form: AshworthFormData) {
  return (
    Object.values(form.grades).filter((value) => value !== "").length +
    (form.notes.trim() ? 1 : 0)
  );
}
