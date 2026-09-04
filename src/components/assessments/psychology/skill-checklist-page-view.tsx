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
  SKILL_SCORE_OPTIONS,
  countSkillScores,
  createEmptySkillChecklistForm,
  sumSkillScores,
  type SkillChecklistForm,
  type SkillDomain,
} from "@/lib/psychology/skill-checklists";

type SkillChecklistPageViewProps = {
  title: string;
  description: string;
  instrument: string;
  domains: readonly SkillDomain[];
  patients: ClinicalPatient[];
};

export function SkillChecklistPageView({
  title,
  description,
  instrument,
  domains,
  patients,
}: SkillChecklistPageViewProps) {
  const [form, setForm] = useState<SkillChecklistForm>(
    createEmptySkillChecklistForm
  );

  function setScore(itemId: string, value: string) {
    setForm((previous) => ({
      ...previous,
      scores: { ...previous.scores, [itemId]: value },
    }));
  }

  return (
    <FonoAssessmentShell
      title={title}
      description={description}
      instrument={instrument}
      patients={patients}
      getFilledCount={() => countSkillScores(form) + (form.notes.trim() ? 1 : 0)}
      getFormData={() => form as unknown as Record<string, unknown>}
      getTotalScore={() => sumSkillScores(form)}
    >
      {({ disabled }) => (
        <div className="space-y-4">
          {domains.map((domain) => (
            <SectionCard key={domain.id} title={domain.title}>
              <div className="grid gap-4">
                {domain.items.map((item) => {
                  const selectId = `${domain.id}-${item.id}`;
                  const value = form.scores[item.id] || null;
                  return (
                    <div key={item.id} className="space-y-2">
                      <Label htmlFor={selectId}>{item.label}</Label>
                      <Select
                        value={value}
                        items={SKILL_SCORE_OPTIONS.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                        onValueChange={(next) =>
                          setScore(item.id, next ?? "")
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger id={selectId} className="h-10 w-full">
                          <SelectValue placeholder="Pontuar" />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_SCORE_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ))}

          <SectionCard title="Observações clínicas">
            <NotesField
              id="skill-notes"
              label="Observações"
              value={form.notes}
              onChange={(notes) =>
                setForm((previous) => ({ ...previous, notes }))
              }
            />
          </SectionCard>
        </div>
      )}
    </FonoAssessmentShell>
  );
}
