"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyToEvolutionFormState,
  TO_ASSISTANCE_LEVELS,
  type ToEvolutionFormState,
} from "@/lib/terapia-ocupacional/to-evolution";
import { cn } from "@/lib/utils";

const inputClassName = "h-11 w-full";
const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ToEvolutionStructuredFormProps = {
  value: ToEvolutionFormState;
  onChange: (value: ToEvolutionFormState) => void;
  disabled?: boolean;
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

export function ToEvolutionStructuredForm({
  value,
  onChange,
  disabled = false,
}: ToEvolutionStructuredFormProps) {
  function update<K extends keyof ToEvolutionFormState>(
    field: K,
    fieldValue: ToEvolutionFormState[K]
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  function toggleAssistance(code: string) {
    const current = value.assistanceLevels;
    update(
      "assistanceLevels",
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field id="to-session-time" label="Hora da sessão">
          <Input
            id="to-session-time"
            type="time"
            className={inputClassName}
            value={value.sessionTime}
            disabled={disabled}
            onChange={(event) => update("sessionTime", event.target.value)}
          />
        </Field>
      </div>

      <Field
        id="to-occupational-diagnosis"
        label="Diagnóstico Terapêutico Ocupacional"
      >
        <Textarea
          id="to-occupational-diagnosis"
          className={textareaClassName}
          value={value.occupationalDiagnosis}
          disabled={disabled}
          onChange={(event) => update("occupationalDiagnosis", event.target.value)}
        />
      </Field>

      <Field
        id="to-resources"
        label="Recursos utilizados"
        hint="Ambiente terapêutico, recursos e/ou aparelhos utilizados na sessão."
      >
        <Textarea
          id="to-resources"
          className={textareaClassName}
          value={value.resourcesUsed}
          disabled={disabled}
          onChange={(event) => update("resourcesUsed", event.target.value)}
        />
      </Field>

      <Field id="to-goals" label="Objetivo da sessão | Metas funcionais">
        <Textarea
          id="to-goals"
          className={textareaClassName}
          value={value.sessionGoals}
          disabled={disabled}
          onChange={(event) => update("sessionGoals", event.target.value)}
        />
      </Field>

      <Field
        id="to-reception"
        label="Recepção e contexto clínico"
        hint="Como recebeu o aprendiz, estado geral e relatos relevantes de saúde ou sessões anteriores."
      >
        <Textarea
          id="to-reception"
          className={textareaClassName}
          value={value.receptionAndContext}
          disabled={disabled}
          onChange={(event) => update("receptionAndContext", event.target.value)}
        />
      </Field>

      <Field
        id="to-engagement"
        label="Engajamento e resposta à intervenção"
        hint="Participação, reações às demandas e setting terapêutico."
      >
        <Textarea
          id="to-engagement"
          className={textareaClassName}
          value={value.engagementAndResponse}
          disabled={disabled}
          onChange={(event) => update("engagementAndResponse", event.target.value)}
        />
      </Field>

      <Field
        id="to-behaviors"
        label="Comportamentos interferentes e manejo"
      >
        <Textarea
          id="to-behaviors"
          className={textareaClassName}
          value={value.interferingBehaviors}
          disabled={disabled}
          onChange={(event) => update("interferingBehaviors", event.target.value)}
        />
      </Field>

      <Field
        id="to-functional"
        label="Desempenho funcional / desempenho ocupacional"
      >
        <Textarea
          id="to-functional"
          className={textareaClassName}
          value={value.functionalPerformance}
          disabled={disabled}
          onChange={(event) => update("functionalPerformance", event.target.value)}
        />
      </Field>

      <Field
        id="to-clinical"
        label="Observações clínicas estruturadas e não estruturadas"
      >
        <Textarea
          id="to-clinical"
          className={textareaClassName}
          value={value.clinicalObservations}
          disabled={disabled}
          onChange={(event) => update("clinicalObservations", event.target.value)}
        />
      </Field>

      <Field
        id="to-motor"
        label="Aspectos motores, sensoriais, cognitivos e socioemocionais"
      >
        <Textarea
          id="to-motor"
          className={textareaClassName}
          value={value.motorSensoryCognitive}
          disabled={disabled}
          onChange={(event) => update("motorSensoryCognitive", event.target.value)}
        />
      </Field>

      <Field id="to-context" label="Intercorrências ou fatores contextuais">
        <Textarea
          id="to-context"
          className={textareaClassName}
          value={value.contextualFactors}
          disabled={disabled}
          onChange={(event) => update("contextualFactors", event.target.value)}
        />
      </Field>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Nível de assistência requerido
        </Label>
        <p className="text-xs text-muted-foreground">
          Selecione os níveis observados na sessão.
        </p>
        <div className="flex flex-wrap gap-2">
          {TO_ASSISTANCE_LEVELS.map((level) => {
            const selected = value.assistanceLevels.includes(level.code);

            return (
              <button
                key={level.code}
                type="button"
                disabled={disabled}
                onClick={() => toggleAssistance(level.code)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                )}
              >
                {level.label}
              </button>
            );
          })}
        </div>
      </div>

      <Field id="to-next" label="Diretriz para a próxima sessão">
        <Textarea
          id="to-next"
          className={textareaClassName}
          value={value.nextSessionGuidelines}
          disabled={disabled}
          onChange={(event) => update("nextSessionGuidelines", event.target.value)}
        />
      </Field>

      <Field id="to-family" label="Orientações à família / escola">
        <Textarea
          id="to-family"
          className={textareaClassName}
          value={value.familySchoolGuidance}
          disabled={disabled}
          onChange={(event) => update("familySchoolGuidance", event.target.value)}
        />
      </Field>
    </div>
  );
}

export { emptyToEvolutionFormState };
