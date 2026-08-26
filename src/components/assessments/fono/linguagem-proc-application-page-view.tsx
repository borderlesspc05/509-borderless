"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  CheckboxGroup,
  NotesField,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  CARACTERISTICAS_COMUNICATIVAS,
  COMPREENSAO_VERBAL,
  countLinguagemProcFilledFields,
  createEmptyLinguagemProcFormData,
  FUNCOES_COMUNICATIVAS,
  HABILIDADES_DIALOGICAS,
  LINGUAGEM_PROC_INSTRUMENT,
  MEIOS_COM_ORALIDADE,
  MEIOS_SEM_ORALIDADE,
  SIMBOLISMO,
  type LinguagemProcFormData,
} from "@/lib/fono/linguagem-proc";

export function LinguagemProcApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<LinguagemProcFormData>(
    createEmptyLinguagemProcFormData
  );

  const patchChecks = <K extends keyof LinguagemProcFormData>(
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
      title="Linguagem Infantil"
      description="Avaliação de linguagem baseada no PROC (Zorzi & Hage) e TIPITI."
      instrument={LINGUAGEM_PROC_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countLinguagemProcFilledFields(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {() => (
        <div className="space-y-4">
          <SectionCard title="Habilidades comunicativas">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Habilidades dialógicas</p>
                <CheckboxGroup
                  options={HABILIDADES_DIALOGICAS}
                  values={form.habilidadesDialogicas}
                  onChange={(key, checked) =>
                    patchChecks("habilidadesDialogicas", key, checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Funções comunicativas</p>
                <CheckboxGroup
                  options={FUNCOES_COMUNICATIVAS}
                  values={form.funcoesComunicativas}
                  onChange={(key, checked) =>
                    patchChecks("funcoesComunicativas", key, checked)
                  }
                  columns={2}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Meios — sem oralidade</p>
                <CheckboxGroup
                  options={MEIOS_SEM_ORALIDADE}
                  values={form.meiosSemOralidade}
                  onChange={(key, checked) =>
                    patchChecks("meiosSemOralidade", key, checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Meios — com oralidade</p>
                <CheckboxGroup
                  options={MEIOS_COM_ORALIDADE}
                  values={form.meiosComOralidade}
                  onChange={(key, checked) =>
                    patchChecks("meiosComOralidade", key, checked)
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Compreensão verbal e simbolismo">
            <div className="space-y-4">
              <CheckboxGroup
                options={COMPREENSAO_VERBAL}
                values={form.compreensaoVerbal}
                onChange={(key, checked) =>
                  patchChecks("compreensaoVerbal", key, checked)
                }
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Nível de simbolismo</p>
                <CheckboxGroup
                  options={SIMBOLISMO}
                  values={form.simbolismo}
                  onChange={(key, checked) =>
                    patchChecks("simbolismo", key, checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Características gerais das habilidades comunicativas
                </p>
                <CheckboxGroup
                  options={CARACTERISTICAS_COMUNICATIVAS}
                  values={form.caracteristicasComunicativas}
                  onChange={(key, checked) =>
                    patchChecks("caracteristicasComunicativas", key, checked)
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Funções básicas, narrativa e comunicação gráfica">
            <NotesField
              id="ling-conceitos"
              label="Conceitos básicos / orientação temporal-espacial / esquema corporal"
              value={form.conceitosBasicos}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, conceitosBasicos: value }))
              }
            />
            <NotesField
              id="ling-narrativa"
              label="Narrativa a partir de cartões em sequência"
              value={form.narrativaSequencia}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, narrativaSequencia: value }))
              }
            />
            <NotesField
              id="ling-grafica"
              label="Comunicação gráfica (letras, cópia, leitura, ditado)"
              value={form.comunicacaoGrafica}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, comunicacaoGrafica: value }))
              }
            />
            <NotesField
              id="ling-obs"
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
