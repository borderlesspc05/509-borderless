"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  CheckboxGroup,
  NotesField,
  RadioGroupField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  ASPIRACAO_OPTIONS,
  countMotricidadeFilledFields,
  createEmptyMotricidadeFormData,
  DEGLUTICAO_SINAIS_OPTIONS,
  DNPM_OPTIONS,
  FACE_TIPO_OPTIONS,
  LABIOS_POSICAO_OPTIONS,
  MASTIGACAO_SOLIDO_OPTIONS,
  MOTRICIDADE_INSTRUMENT,
  RESPIRACAO_MODO_OPTIONS,
  TONICIDADE_OPTIONS,
  type MotricidadeFormData,
} from "@/lib/fono/motricidade-orofacial";

export function MotricidadeApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<MotricidadeFormData>(
    createEmptyMotricidadeFormData
  );

  const patchChecks = <K extends keyof MotricidadeFormData>(
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

  return (
    <FonoAssessmentShell
      title="Motricidade Orofacial"
      description="Avaliação fonoaudiológica infantil de motricidade orofacial (adaptação MBGR)."
      instrument={MOTRICIDADE_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countMotricidadeFilledFields(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {() => (
        <div className="space-y-4">
          <SectionCard title="Características antropomórficas e DNPM">
            <NotesField
              id="motr-antropo"
              label="Características antropomórficas"
              value={form.antropomorficas}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, antropomorficas: value }))
              }
            />
            <CheckboxGroup
              options={DNPM_OPTIONS}
              values={form.dnpm}
              onChange={(key, checked) => patchChecks("dnpm", key, checked)}
              columns={2}
            />
            <NotesField
              id="motr-dnpm-obs"
              label="Reflexos / observações DNPM"
              value={form.dnpmObs}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, dnpmObs: value }))
              }
              rows={2}
            />
          </SectionCard>

          <SectionCard title="Órgãos fonoarticulatórios">
            <div className="grid gap-4">
              <RadioGroupField
                name="tipoFacial"
                label="Tipo facial"
                value={form.tipoFacial}
                options={FACE_TIPO_OPTIONS}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, tipoFacial: value }))
                }
              />
              <NotesField
                id="motr-dentes"
                label="Dentes (tipo / oclusão / conservação)"
                value={`${form.dentesTipo}${form.oclusao ? ` | ${form.oclusao}` : ""}`}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    dentesTipo: value,
                    oclusao: "",
                  }))
                }
                rows={2}
              />
              <RadioGroupField
                name="labiosPosicao"
                label="Lábios — posição habitual"
                value={form.labiosPosicao}
                options={LABIOS_POSICAO_OPTIONS}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, labiosPosicao: value }))
                }
              />
              <RadioGroupField
                name="labiosTonus"
                label="Lábios — tonicidade"
                value={form.labiosTonus}
                options={TONICIDADE_OPTIONS}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, labiosTonus: value }))
                }
              />
              <NotesField
                id="motr-lingua"
                label="Língua (posição / morfologia / freio)"
                value={[form.linguaPosicao, form.linguaTonus, form.freioLingual]
                  .filter(Boolean)
                  .join(" | ")}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    linguaPosicao: value,
                    linguaTonus: "",
                    freioLingual: "",
                  }))
                }
              />
              <NotesField
                id="motr-palato-atm"
                label="Palato / ATM"
                value={[form.palatoDuro, form.atm].filter(Boolean).join(" | ")}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    palatoDuro: value,
                    atm: "",
                  }))
                }
                rows={2}
              />
            </div>
          </SectionCard>

          <SectionCard title="Funções neurovegetativas">
            <RadioGroupField
              name="respiracaoModo"
              label="Respiração — modo"
              value={form.respiracaoModo}
              options={RESPIRACAO_MODO_OPTIONS}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, respiracaoModo: value }))
              }
            />
            <NotesField
              id="motr-resp-tipo"
              label="Respiração — tipo / ritmo"
              value={form.respiracaoTipo}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, respiracaoTipo: value }))
              }
              rows={2}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Mastigação — sólido</p>
              <CheckboxGroup
                options={MASTIGACAO_SOLIDO_OPTIONS}
                values={form.mastigacaoSolido}
                onChange={(key, checked) =>
                  patchChecks("mastigacaoSolido", key, checked)
                }
                columns={2}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Deglutição — sinais</p>
              <CheckboxGroup
                options={DEGLUTICAO_SINAIS_OPTIONS}
                values={form.degluticaoSinais}
                onChange={(key, checked) =>
                  patchChecks("degluticaoSinais", key, checked)
                }
                columns={2}
              />
            </div>
            <NotesField
              id="motr-coord"
              label="Coordenação mastigação-deglutição-respiração"
              value={form.coordenacaoMdr}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, coordenacaoMdr: value }))
              }
              rows={2}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Sinais de aspiração</p>
              <CheckboxGroup
                options={ASPIRACAO_OPTIONS}
                values={form.aspiracao}
                onChange={(key, checked) =>
                  patchChecks("aspiracao", key, checked)
                }
                columns={2}
              />
            </div>
          </SectionCard>

          <SectionCard title="Voz e observações">
            <NotesField
              id="motr-voz"
              label="Voz (intensidade / tonalidade / ritmo)"
              value={[form.vozIntensidade, form.vozTonalidade, form.vozRitmo]
                .filter(Boolean)
                .join(" | ")}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  vozIntensidade: value,
                  vozTonalidade: "",
                  vozRitmo: "",
                }))
              }
              rows={2}
            />
            <NotesField
              id="motr-obs"
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
