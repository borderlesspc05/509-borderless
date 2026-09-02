"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  NotesField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
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
  ASHWORTH_GRADES,
  ASHWORTH_INSTRUMENT,
  ASHWORTH_SEGMENTS,
  countAshworthFilled,
  createEmptyAshworthFormData,
  type AshworthFormData,
  type AshworthGrade,
} from "@/lib/ashworth";

export function AshworthApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<AshworthFormData>(createEmptyAshworthFormData);

  return (
    <FonoAssessmentShell
      title="Escala de Ashworth Modificada"
      description="Tabela clínica de espasticidade / tônus muscular por segmento."
      instrument={ASHWORTH_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countAshworthFilled(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {({ disabled }) => (
        <SectionCard
          title="Tabela da Escala Modificada de Ashworth"
          description="Selecione o grau (0 a 4, incluindo 1+) para cada segmento avaliado."
        >
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Segmento</th>
                  <th className="px-3 py-2 font-medium">Grau</th>
                  <th className="px-3 py-2 font-medium">Descrição do grau</th>
                </tr>
              </thead>
              <tbody>
                {ASHWORTH_SEGMENTS.map((segment) => {
                  const grade = form.grades[segment.id] ?? "";
                  const description =
                    ASHWORTH_GRADES.find((item) => item.value === grade)
                      ?.description ?? "—";

                  return (
                    <tr key={segment.id} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {segment.label}
                      </td>
                      <td className="px-3 py-2">
                        <Label htmlFor={`ashworth-${segment.id}`} className="sr-only">
                          Grau {segment.label}
                        </Label>
                        <Select
                          value={grade || null}
                          items={ASHWORTH_GRADES.map((item) => ({
                            label: item.label,
                            value: item.value,
                          }))}
                          onValueChange={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              grades: {
                                ...prev.grades,
                                [segment.id]: (value ?? "") as AshworthGrade,
                              },
                            }))
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger
                            id={`ashworth-${segment.id}`}
                            className="h-9 w-24"
                          >
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {ASHWORTH_GRADES.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Legenda rápida</p>
            <ul className="mt-2 space-y-1">
              {ASHWORTH_GRADES.map((grade) => (
                <li key={grade.value}>
                  <strong>{grade.label}:</strong> {grade.description}
                </li>
              ))}
            </ul>
          </div>

          <NotesField
            id="ashworth-notes"
            label="Observações clínicas"
            value={form.notes}
            onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
          />
        </SectionCard>
      )}
    </FonoAssessmentShell>
  );
}
