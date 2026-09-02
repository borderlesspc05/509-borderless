/** Pediatric Balance Scale (PBS) — equilíbrio pediátrico (0–56). */

export const PBS_TEMPLATE_NAME = "Pediatric Balance Scale (PBS)";
export const PBS_INSTRUMENT = "PBS";

export const PBS_ITEMS = [
  { id: "1", label: "Sentar → ficar em pé" },
  { id: "2", label: "Em pé → sentar" },
  { id: "3", label: "Transferências" },
  { id: "4", label: "Em pé sem apoio (30 s)" },
  { id: "5", label: "Sentado sem apoio (30 s)" },
  { id: "6", label: "Em pé com olhos fechados" },
  { id: "7", label: "Em pé com pés juntos" },
  { id: "8", label: "Um pé à frente (tandem)" },
  { id: "9", label: "Apoio unipodal" },
  { id: "10", label: "Girar 360°" },
  { id: "11", label: "Virar para olhar atrás" },
  { id: "12", label: "Pegar objeto no chão" },
  { id: "13", label: "Pé alternado no banco" },
  { id: "14", label: "Alcance à frente" },
] as const;

export const PBS_SCORE_OPTIONS = [
  { value: "", label: "—" },
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
] as const;

export type PbsFormData = {
  scores: Record<string, string>;
  times: Record<string, string>;
  notes: string;
};

export function createEmptyPbsFormData(): PbsFormData {
  return {
    scores: Object.fromEntries(PBS_ITEMS.map((item) => [item.id, ""])),
    times: Object.fromEntries(PBS_ITEMS.map((item) => [item.id, ""])),
    notes: "",
  };
}

export function countPbsFilled(form: PbsFormData) {
  return (
    Object.values(form.scores).filter(Boolean).length +
    Object.values(form.times).filter((value) => value.trim()).length +
    (form.notes.trim() ? 1 : 0)
  );
}

export function sumPbsScore(form: PbsFormData) {
  return Object.values(form.scores).reduce((sum, value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);
}

export const PBS_MAX_SCORE = 56;
