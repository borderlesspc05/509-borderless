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
  countMbgrFilledFields,
  createEmptyMbgrFormData,
  MBGR_DEGLUTICAO,
  MBGR_FALA,
  MBGR_INSTRUMENT,
  MBGR_MASTIGACAO,
  MBGR_POSTURA_CABECA,
  MBGR_RESPIRACAO,
  type MbgrFormData,
} from "@/lib/fono/mbgr";

export function MbgrApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<MbgrFormData>(createEmptyMbgrFormData);

  const patchChecks = <K extends keyof MbgrFormData>(
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
      title="MBGR — Exame"
      description="Exame miofuncional orofacial MBGR (parte clínica). A história clínica fica na anamnese de Fonoaudiologia."
      instrument={MBGR_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countMbgrFilledFields(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
    >
      {() => (
        <div className="space-y-4">
          <SectionCard title="Postura e respiração">
            <CheckboxGroup
              options={MBGR_POSTURA_CABECA}
              values={form.posturaCabeca}
              onChange={(key, checked) =>
                patchChecks("posturaCabeca", key, checked)
              }
              columns={2}
            />
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Respiração</p>
              <CheckboxGroup
                options={MBGR_RESPIRACAO}
                values={form.respiracao}
                onChange={(key, checked) =>
                  patchChecks("respiracao", key, checked)
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="Estruturas orofaciais">
            <NotesField
              id="mbgr-labios"
              label="Lábios — posição habitual"
              value={form.labiosHabitual}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, labiosHabitual: value }))
              }
              rows={2}
            />
            <NotesField
              id="mbgr-lingua"
              label="Língua — posição habitual"
              value={form.linguaHabitual}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, linguaHabitual: value }))
              }
              rows={2}
            />
            <NotesField
              id="mbgr-tonus"
              label="Tonicidade (lábios / língua)"
              value={[form.tonusLabios, form.tonusLingua]
                .filter(Boolean)
                .join(" | ")}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  tonusLabios: value,
                  tonusLingua: "",
                }))
              }
              rows={2}
            />
            <NotesField
              id="mbgr-freio"
              label="Frênulo lingual"
              value={form.freioLingual}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, freioLingual: value }))
              }
              rows={2}
            />
            <NotesField
              id="mbgr-atm"
              label="ATM"
              value={form.atm}
              onChange={(value) => setForm((prev) => ({ ...prev, atm: value }))}
              rows={2}
            />
          </SectionCard>

          <SectionCard title="Funções">
            <div className="space-y-2">
              <p className="text-sm font-medium">Mastigação</p>
              <CheckboxGroup
                options={MBGR_MASTIGACAO}
                values={form.mastigacao}
                onChange={(key, checked) =>
                  patchChecks("mastigacao", key, checked)
                }
                columns={2}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Deglutição</p>
              <CheckboxGroup
                options={MBGR_DEGLUTICAO}
                values={form.degluticao}
                onChange={(key, checked) =>
                  patchChecks("degluticao", key, checked)
                }
                columns={2}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Fala</p>
              <CheckboxGroup
                options={MBGR_FALA}
                values={form.fala}
                onChange={(key, checked) => patchChecks("fala", key, checked)}
                columns={2}
              />
            </div>
            <NotesField
              id="mbgr-voz"
              label="Voz"
              value={form.voz}
              onChange={(value) => setForm((prev) => ({ ...prev, voz: value }))}
              rows={2}
            />
          </SectionCard>

          <SectionCard title="Conclusão">
            <NotesField
              id="mbgr-conclusao"
              label="Conclusão clínica"
              value={form.conclusao}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, conclusao: value }))
              }
            />
            <NotesField
              id="mbgr-obs"
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
