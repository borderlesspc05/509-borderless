"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { saveAnamnesisAction } from "@/app/actions/anamnesis-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  TO_COGNITIVO_SOCIAL_OPTIONS,
  TO_COMPONENTES_MOTORES_OPTIONS,
  TO_DESENVOLVIMENTO_OPTIONS,
  TO_MUSCULO_ESQUELETICO_OPTIONS,
  createEmptyAnamnesisTerapiaOcupacionalForm,
  type AnamnesisTerapiaOcupacionalFormData,
} from "@/lib/anamnesis-terapia-ocupacional";

function CheckboxGroup({
  title,
  options,
  values,
  onToggle,
  observationId,
  observationLabel,
  observationValue,
  onObservationChange,
}: {
  title: string;
  options: readonly { key: string; label: string }[];
  values: Record<string, boolean>;
  onToggle: (key: string, checked: boolean) => void;
  observationId: string;
  observationLabel: string;
  observationValue: string;
  onObservationChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {options.map((option) => (
          <label key={option.key} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(values[option.key])}
              onChange={(event) => onToggle(option.key, event.target.checked)}
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor={observationId}>{observationLabel}</Label>
        <Textarea
          id={observationId}
          value={observationValue}
          onChange={(event) => onObservationChange(event.target.value)}
          placeholder="Ex.: marco presente, porém atrasado; adquirido por curto período; observações clínicas relevantes."
          rows={3}
        />
      </div>
    </div>
  );
}

export function AnamnesisTerapiaOcupacionalForm({
  patientId,
  onSuccess,
}: {
  patientId: string;
  onSuccess?: () => void;
}) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] =
    useState<AnamnesisTerapiaOcupacionalFormData>(
      createEmptyAnamnesisTerapiaOcupacionalForm
    );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "terapia_ocupacional",
        formData,
      });

      if (result.success) {
        toast.success({
          title: "Anamnese salva",
          description:
            "O formulário de terapia ocupacional foi registrado com sucesso.",
        });
        onSuccess?.();
      } else {
        toast.error({ title: "Erro", description: result.error });
      }
    });
  };

  function updateField<K extends keyof AnamnesisTerapiaOcupacionalFormData>(
    field: K,
    value: AnamnesisTerapiaOcupacionalFormData[K]
  ) {
    setFormData((previous) => ({ ...previous, [field]: value }));
  }

  function updateNestedField(
    group: "sono" | "alimentacaoInfo",
    field: string,
    value: string | boolean
  ) {
    setFormData((previous) => ({
      ...previous,
      [group]: {
        ...previous[group],
        [field]: value,
      },
    }));
  }

  function toggleGroup(
    group:
      | "desenvolvimento"
      | "alteracaoMusculoEsqueletica"
      | "componentesMotores"
      | "cognitivoSocial",
    key: string,
    checked: boolean
  ) {
    setFormData((previous) => ({
      ...previous,
      [group]: {
        ...previous[group],
        [key]: checked,
      },
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Diagnóstico, Queixas e Saúde
        </h3>

        <div className="space-y-2">
          <Label htmlFor="to-queixa">Queixa principal e diagnóstico</Label>
          <Textarea
            id="to-queixa"
            value={formData.queixaPrincipal}
            onChange={(event) =>
              updateField("queixaPrincipal", event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-medicamentos">Medicamentos</Label>
          <Input
            id="to-medicamentos"
            value={formData.medicamentos}
            onChange={(event) =>
              updateField("medicamentos", event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-historia">
            História pregressa (gestação, parto, saúde)
          </Label>
          <Textarea
            id="to-historia"
            value={formData.historiaPregressa}
            onChange={(event) =>
              updateField("historiaPregressa", event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-alergias">
            Alergias (alimentar, medicamento, etc.)
          </Label>
          <Input
            id="to-alergias"
            value={formData.alergias}
            onChange={(event) => updateField("alergias", event.target.value)}
          />
        </div>
      </div>

      <CheckboxGroup
        title="Histórico do desenvolvimento"
        options={TO_DESENVOLVIMENTO_OPTIONS}
        values={formData.desenvolvimento}
        onToggle={(key, checked) =>
          toggleGroup("desenvolvimento", key, checked)
        }
        observationId="to-obs-desenvolvimento"
        observationLabel="Observações dos marcos (atraso, perda, período curto, etc.)"
        observationValue={formData.observacoesDesenvolvimento}
        onObservationChange={(value) =>
          updateField("observacoesDesenvolvimento", value)
        }
      />

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Sono, alimentação e desfralde
        </h3>
        <div className="space-y-2">
          <Label htmlFor="to-sono">Dificuldades no padrão do sono</Label>
          <Input
            id="to-sono"
            value={formData.sono.dificuldades}
            onChange={(event) =>
              updateNestedField("sono", "dificuldades", event.target.value)
            }
          />
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          {(
            [
              ["bebeAgitado", "Bebê agitado"],
              ["choravaMuito", "Chorava muito"],
              ["excessivamentePassivo", "Excessivamente passivo"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.sono[key]}
                onChange={(event) =>
                  updateNestedField("sono", key, event.target.checked)
                }
                className="size-4 rounded border-input"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-obs-sono">Observações do sono</Label>
          <Textarea
            id="to-obs-sono"
            value={formData.observacoesSono}
            onChange={(event) =>
              updateField("observacoesSono", event.target.value)
            }
            rows={2}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="to-idade-alim">Idade de introdução alimentar</Label>
            <Input
              id="to-idade-alim"
              value={formData.alimentacaoInfo.idadeIntroducao}
              onChange={(event) =>
                updateNestedField(
                  "alimentacaoInfo",
                  "idadeIntroducao",
                  event.target.value
                )
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="to-oferta">Como ofertava os alimentos</Label>
            <Input
              id="to-oferta"
              value={formData.alimentacaoInfo.comoOfertava}
              onChange={(event) =>
                updateNestedField(
                  "alimentacaoInfo",
                  "comoOfertava",
                  event.target.value
                )
              }
              placeholder="Inteiros, batidos, amassados..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-engasgo">Engasgava/engasga com alimentos ou líquidos</Label>
          <Input
            id="to-engasgo"
            value={formData.alimentacaoInfo.engasgava}
            onChange={(event) =>
              updateNestedField(
                "alimentacaoInfo",
                "engasgava",
                event.target.value
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-desfralde">Retirada da fralda / desfralde</Label>
          <Textarea
            id="to-desfralde"
            value={formData.desfralde}
            onChange={(event) => updateField("desfralde", event.target.value)}
            placeholder="Idade, processo, dificuldades, sucesso parcial, regressões..."
            rows={3}
          />
        </div>
      </div>

      <CheckboxGroup
        title="Componentes músculo-esqueléticos"
        options={TO_MUSCULO_ESQUELETICO_OPTIONS}
        values={formData.alteracaoMusculoEsqueletica}
        onToggle={(key, checked) =>
          toggleGroup("alteracaoMusculoEsqueletica", key, checked)
        }
        observationId="to-obs-musculo"
        observationLabel="Observações músculo-esqueléticas"
        observationValue={formData.observacoesMusculoEsqueletico}
        onObservationChange={(value) =>
          updateField("observacoesMusculoEsqueletico", value)
        }
      />

      <CheckboxGroup
        title="Componentes de desempenho motores"
        options={TO_COMPONENTES_MOTORES_OPTIONS}
        values={formData.componentesMotores}
        onToggle={(key, checked) =>
          toggleGroup("componentesMotores", key, checked)
        }
        observationId="to-obs-motores"
        observationLabel="Observações motoras"
        observationValue={formData.observacoesMotores}
        onObservationChange={(value) =>
          updateField("observacoesMotores", value)
        }
      />

      <div className="space-y-2 rounded-xl border border-border/80 bg-card p-5">
        <Label htmlFor="to-dominancia">Dominância</Label>
        <Input
          id="to-dominancia"
          value={formData.dominancia}
          onChange={(event) => updateField("dominancia", event.target.value)}
          placeholder="Direita, esquerda, indefinida..."
        />
      </div>

      <CheckboxGroup
        title="Componentes cognitivo e social"
        options={TO_COGNITIVO_SOCIAL_OPTIONS}
        values={formData.cognitivoSocial}
        onToggle={(key, checked) =>
          toggleGroup("cognitivoSocial", key, checked)
        }
        observationId="to-obs-cog"
        observationLabel="Observações cognitivo-sociais"
        observationValue={formData.observacoesCognitivoSocial}
        onObservationChange={(value) =>
          updateField("observacoesCognitivoSocial", value)
        }
      />

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Escola, AVDs, rotina e objetivos
        </h3>

        {(
          [
            ["escola", "Escola (nome, contraturno, queixas)"],
            ["higiene", "Higiene (banheiro, lavar as mãos)"],
            ["banho", "Banho"],
            ["vestuario", "Vestuário"],
            ["alimentacao", "Alimentação (AVD)"],
            ["rotina", "Rotina diária"],
            ["objetivosFamilia", "Objetivos da família"],
          ] as const
        ).map(([field, label]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={`to-${field}`}>{label}</Label>
            <Textarea
              id={`to-${field}`}
              value={formData[field]}
              onChange={(event) => updateField(field, event.target.value)}
              rows={field === "objetivosFamilia" ? 3 : 2}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar Anamnese"}
        </Button>
      </div>
    </form>
  );
}
