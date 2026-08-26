"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { saveAnamnesisAction } from "@/app/actions/anamnesis-actions";
import {
  CheckboxGroup,
  NotesField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import { Button } from "@/components/ui/button";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  createEmptyAnamnesisFonoFormData,
  FONO_COMUNICACAO_OPTIONS,
  FONO_FALA_OPTIONS,
  FONO_HABITOS_ORAIS,
  FONO_QUEIXAS_OPTIONS,
  FONO_SONO_OPTIONS,
  type AnamnesisFonoFormData,
} from "@/lib/anamnesis-fonoaudiologia";

export function AnamnesisFonoaudiologiaForm({
  patientId,
  onSuccess,
}: {
  patientId: string;
  onSuccess?: () => void;
}) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<AnamnesisFonoFormData>(
    createEmptyAnamnesisFonoFormData
  );

  const patchChecks = <K extends keyof AnamnesisFonoFormData>(
    group: K,
    key: string,
    checked: boolean
  ) =>
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] as Record<string, boolean>),
        [key]: checked,
      },
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "fonoaudiologia",
        formData: form,
      });

      if (result.success) {
        toast.success({
          title: "Anamnese salva",
          description: "Anamnese de Fonoaudiologia registrada.",
        });
        onSuccess?.();
      } else {
        toast.error({
          title: "Erro",
          description: result.error ?? "Falha ao salvar.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionCard
        title="Queixa e história"
        description="Baseada na História Clínica do protocolo MBGR."
      >
        <NotesField
          id="fono-queixa"
          label="Queixa principal"
          value={form.queixaPrincipal}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, queixaPrincipal: value }))
          }
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Outras queixas relacionadas</p>
          <CheckboxGroup
            options={FONO_QUEIXAS_OPTIONS}
            values={form.outrasQueixas}
            onChange={(key, checked) =>
              patchChecks("outrasQueixas", key, checked)
            }
            columns={2}
          />
        </div>
        <NotesField
          id="fono-antecedentes"
          label="Antecedentes familiares"
          value={form.antecedentesFamiliares}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, antecedentesFamiliares: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-gestacao"
          label="Intercorrências na gestação"
          value={form.gestacao}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, gestacao: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-nascimento"
          label="Intercorrências no nascimento"
          value={form.nascimento}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, nascimento: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-dnpm"
          label="Desenvolvimento motor"
          value={form.desenvolvimentoMotor}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, desenvolvimentoMotor: value }))
          }
          rows={2}
        />
      </SectionCard>

      <SectionCard title="Saúde, sono e alimentação">
        <NotesField
          id="fono-saude"
          label="Problemas de saúde"
          value={form.problemasSaude}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, problemasSaude: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-resp"
          label="Problemas respiratórios"
          value={form.problemasRespiratorios}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, problemasRespiratorios: value }))
          }
          rows={2}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Sono</p>
          <CheckboxGroup
            options={FONO_SONO_OPTIONS}
            values={form.sono}
            onChange={(key, checked) => patchChecks("sono", key, checked)}
            columns={2}
          />
        </div>
        <NotesField
          id="fono-amamentacao"
          label="Amamentação"
          value={form.amamentacao}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, amamentacao: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-alimentacao"
          label="Alimentação atual"
          value={form.alimentacaoAtual}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, alimentacaoAtual: value }))
          }
          rows={2}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Hábitos orais</p>
          <CheckboxGroup
            options={FONO_HABITOS_ORAIS}
            values={form.habitosOrais}
            onChange={(key, checked) =>
              patchChecks("habitosOrais", key, checked)
            }
            columns={2}
          />
        </div>
      </SectionCard>

      <SectionCard title="Comunicação, fala, audição e voz">
        <CheckboxGroup
          options={FONO_COMUNICACAO_OPTIONS}
          values={form.comunicacao}
          onChange={(key, checked) => patchChecks("comunicacao", key, checked)}
        />
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">Fala</p>
          <CheckboxGroup
            options={FONO_FALA_OPTIONS}
            values={form.fala}
            onChange={(key, checked) => patchChecks("fala", key, checked)}
            columns={2}
          />
        </div>
        <NotesField
          id="fono-audicao"
          label="Audição"
          value={form.audicao}
          onChange={(value) => setForm((prev) => ({ ...prev, audicao: value }))}
          rows={2}
        />
        <NotesField
          id="fono-voz"
          label="Voz"
          value={form.voz}
          onChange={(value) => setForm((prev) => ({ ...prev, voz: value }))}
          rows={2}
        />
        <NotesField
          id="fono-escola"
          label="Escolaridade"
          value={form.escolaridade}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, escolaridade: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-tratamentos"
          label="Tratamentos anteriores"
          value={form.tratamentosAnteriores}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, tratamentosAnteriores: value }))
          }
          rows={2}
        />
        <NotesField
          id="fono-obs"
          label="Observações"
          value={form.observacoes}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, observacoes: value }))
          }
        />
      </SectionCard>

      <Button type="submit" disabled={isPending} className="gap-2">
        <Save className="size-4" />
        {isPending ? "Salvando..." : "Salvar anamnese de Fonoaudiologia"}
      </Button>
    </form>
  );
}
