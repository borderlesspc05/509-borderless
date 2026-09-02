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
  countPopFilled,
  createEmptyPopFormData,
  POP_DIMENSIONS,
  POP_INSTRUMENT,
  POP_ITEM_LEVELS,
  POP_PARTICIPACAO_OPTIONS,
  POP_REACOES_OPTIONS,
  POP_VINCULO_OPTIONS,
  type PopFormData,
} from "@/lib/pop";

function OptionSelect({
  id,
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { key: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || null}
        items={options.map((option) => ({
          label: option.label,
          value: option.key,
        }))}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="h-10 w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PopApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<PopFormData>(createEmptyPopFormData);

  return (
    <FonoAssessmentShell
      title="POP — Protocolo de Observação Psicomotora"
      description="Observação estruturada de motricidade, praxias, organização espacial/temporal e vínculo."
      instrument={POP_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countPopFilled(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {({ disabled }) => (
        <div className="space-y-4">
          <SectionCard title="Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pop-age">Idade</Label>
                <Input
                  id="pop-age"
                  value={form.header.childAge}
                  disabled={disabled}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      header: { ...prev.header, childAge: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pop-dx">Diagnóstico clínico</Label>
                <Input
                  id="pop-dx"
                  value={form.header.diagnosis}
                  disabled={disabled}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      header: { ...prev.header, diagnosis: event.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="1. Observação geral">
            <NotesField
              id="pop-comportamento"
              label="Comportamento inicial"
              value={form.observacaoGeral.comportamentoInicial}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  observacaoGeral: {
                    ...prev.observacaoGeral,
                    comportamentoInicial: value,
                  },
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <OptionSelect
                id="pop-vinculo"
                label="Vínculo"
                value={form.observacaoGeral.vinculo}
                options={POP_VINCULO_OPTIONS}
                disabled={disabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    observacaoGeral: { ...prev.observacaoGeral, vinculo: value },
                  }))
                }
              />
              <OptionSelect
                id="pop-reacoes"
                label="Reações ao ambiente"
                value={form.observacaoGeral.reacoesAmbiente}
                options={POP_REACOES_OPTIONS}
                disabled={disabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    observacaoGeral: {
                      ...prev.observacaoGeral,
                      reacoesAmbiente: value,
                    },
                  }))
                }
              />
              <OptionSelect
                id="pop-participacao"
                label="Participação"
                value={form.observacaoGeral.participacao}
                options={POP_PARTICIPACAO_OPTIONS}
                disabled={disabled}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    observacaoGeral: {
                      ...prev.observacaoGeral,
                      participacao: value,
                    },
                  }))
                }
              />
            </div>
          </SectionCard>

          {POP_DIMENSIONS.map((dimension, index) => (
            <SectionCard
              key={dimension.id}
              title={`${index + 2}. ${dimension.title}`}
            >
              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium">Habilidade / aspecto</th>
                      <th className="px-3 py-2 font-medium">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dimension.items.map((item) => (
                      <tr key={item.key} className="border-t border-border/60">
                        <td className="px-3 py-2">{item.label}</td>
                        <td className="px-3 py-2">
                          <Select
                            value={
                              form.dimensions[dimension.id]?.[item.key] || null
                            }
                            items={POP_ITEM_LEVELS.filter((level) => level.value).map(
                              (level) => ({
                                label: level.label,
                                value: level.value,
                              })
                            )}
                            onValueChange={(value) =>
                              setForm((prev) => ({
                                ...prev,
                                dimensions: {
                                  ...prev.dimensions,
                                  [dimension.id]: {
                                    ...prev.dimensions[dimension.id],
                                    [item.key]: value ?? "",
                                  },
                                },
                              }))
                            }
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-9 w-44">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {POP_ITEM_LEVELS.filter((level) => level.value).map(
                                (level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <NotesField
                id={`pop-notes-${dimension.id}`}
                label="Outras observações"
                value={form.dimensionNotes[dimension.id] ?? ""}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    dimensionNotes: {
                      ...prev.dimensionNotes,
                      [dimension.id]: value,
                    },
                  }))
                }
              />
            </SectionCard>
          ))}

          <SectionCard title="9. Análise e conclusões">
            <NotesField
              id="pop-conclusoes"
              label="Conclusões"
              value={form.conclusoes}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, conclusoes: value }))
              }
            />
          </SectionCard>
        </div>
      )}
    </FonoAssessmentShell>
  );
}
