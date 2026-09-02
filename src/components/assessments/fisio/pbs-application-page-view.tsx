"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  NotesField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  countPbsFilled,
  createEmptyPbsFormData,
  PBS_INSTRUMENT,
  PBS_ITEMS,
  PBS_MAX_SCORE,
  PBS_SCORE_OPTIONS,
  sumPbsScore,
  type PbsFormData,
} from "@/lib/pbs";

export function PbsApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<PbsFormData>(createEmptyPbsFormData);
  const total = sumPbsScore(form);

  return (
    <FonoAssessmentShell
      title="Pediatric Balance Scale (PBS)"
      description="Escala pediátrica de equilíbrio — 14 itens, pontuação 0 a 4 (máximo 56)."
      instrument={PBS_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countPbsFilled(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
      getTotalScore={() => total}
    >
      {({ disabled }) => (
        <SectionCard
          title="Itens da PBS"
          description={`Total atual: ${total}/${PBS_MAX_SCORE}`}
        >
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">Escore (0–4)</th>
                  <th className="px-3 py-2 font-medium">Tempo (s)</th>
                </tr>
              </thead>
              <tbody>
                {PBS_ITEMS.map((item) => (
                  <tr key={item.id} className="border-t border-border/60">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {item.id}
                    </td>
                    <td className="px-3 py-2 font-medium">{item.label}</td>
                    <td className="px-3 py-2">
                      <Select
                        value={form.scores[item.id] || null}
                        items={PBS_SCORE_OPTIONS.filter((option) => option.value).map(
                          (option) => ({
                            label: option.label,
                            value: option.value,
                          })
                        )}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            scores: {
                              ...prev.scores,
                              [item.id]: value ?? "",
                            },
                          }))
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger className="h-9 w-24">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {PBS_SCORE_OPTIONS.filter((option) => option.value).map(
                            (option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Label htmlFor={`pbs-time-${item.id}`} className="sr-only">
                        Tempo {item.label}
                      </Label>
                      <Input
                        id={`pbs-time-${item.id}`}
                        className="h-9 w-28"
                        inputMode="decimal"
                        placeholder="opcional"
                        value={form.times[item.id] ?? ""}
                        disabled={disabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            times: {
                              ...prev.times,
                              [item.id]: event.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <NotesField
            id="pbs-notes"
            label="Observações"
            value={form.notes}
            onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
          />
        </SectionCard>
      )}
    </FonoAssessmentShell>
  );
}
