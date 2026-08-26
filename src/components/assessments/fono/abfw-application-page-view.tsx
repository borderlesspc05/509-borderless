"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  NotesField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import { Label } from "@/components/ui/label";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  ABFW_INSTRUMENT,
  ABFW_PHONEMES,
  ABFW_STATUS_OPTIONS,
  countAbfwFilledFields,
  createEmptyAbfwFormData,
  type AbfwFormData,
  type AbfwPhonemeStatus,
} from "@/lib/fono/abfw";

export function AbfwApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<AbfwFormData>(createEmptyAbfwFormData);

  return (
    <FonoAssessmentShell
      title="ABFW — Fonologia"
      description="Prova de fonologia (quadro fonético + emissão/recepção). Use as figuras do protocolo em apoio."
      instrument={ABFW_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countAbfwFilledFields(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {() => (
        <div className="space-y-4">
          <SectionCard title="Emissão e recepção">
            <NotesField
              id="abfw-emissao"
              label="Emissão — figuras evocativas / álbum articulatório"
              value={form.emissaoFiguras}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, emissaoFiguras: value }))
              }
            />
            <NotesField
              id="abfw-recepcao"
              label="Recepção — lista de palavras"
              value={form.recepcaoLista}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, recepcaoLista: value }))
              }
            />
          </SectionCard>

          <SectionCard
            title="Quadro fonético"
            description="Marque o status de cada fone observado."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ABFW_PHONEMES.map((phoneme) => (
                <div key={phoneme} className="space-y-1.5">
                  <Label htmlFor={`abfw-${phoneme}`}>{phoneme}</Label>
                  <select
                    id={`abfw-${phoneme}`}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                    value={form.quadroFonologico[phoneme]}
                    onChange={(event) => {
                      const value = event.target.value as AbfwPhonemeStatus;
                      setForm((prev) => ({
                        ...prev,
                        quadroFonologico: {
                          ...prev.quadroFonologico,
                          [phoneme]: value,
                        },
                      }));
                    }}
                  >
                    <option value="">—</option>
                    {ABFW_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Processos e inteligibilidade">
            <NotesField
              id="abfw-processos"
              label="Processos fonológicos observados"
              value={form.processosFonologicos}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, processosFonologicos: value }))
              }
            />
            <NotesField
              id="abfw-intel"
              label="Inteligibilidade"
              value={form.inteligibilidade}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, inteligibilidade: value }))
              }
              rows={2}
            />
            <NotesField
              id="abfw-obs"
              label="Observações"
              value={form.observacoes}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, observacoes: value }))
              }
            />
          </SectionCard>
        </div>
      )}
    </FonoAssessmentShell>
  );
}
