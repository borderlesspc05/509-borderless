"use client";

import { useState } from "react";

import { FonoAssessmentShell } from "@/components/assessments/fono/fono-assessment-shell";
import {
  NotesField,
  ScoreSelect,
  SectionCard,
} from "@/components/assessments/fono/fono-form-primitives";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import {
  AMIOFE_INSTRUMENT,
  AMIOFE_MASTIGACAO_TRITURACAO,
  AMIOFE_MOBILIDADE_BOCHECHAS,
  AMIOFE_MOBILIDADE_LABIOS,
  AMIOFE_MOBILIDADE_LINGUA,
  AMIOFE_MOBILIDADE_MANDIBULA,
  AMIOFE_SCORE_3_2_1,
  countAmiofeFilledFields,
  createEmptyAmiofeFormData,
  sumAmiofeScores,
  type AmiofeFormData,
} from "@/lib/fono/amiofe";

export function AmiofeApplicationPageView({
  patients,
}: {
  patients: ClinicalPatient[];
}) {
  const [form, setForm] = useState<AmiofeFormData>(createEmptyAmiofeFormData);

  const setAparencia = (key: keyof AmiofeFormData["aparencia"], value: number | null) =>
    setForm((prev) => ({
      ...prev,
      aparencia: { ...prev.aparencia, [key]: value },
    }));

  const setFuncao = (key: keyof AmiofeFormData["funcoes"], value: number | null) =>
    setForm((prev) => ({
      ...prev,
      funcoes: { ...prev.funcoes, [key]: value },
    }));

  const setMob = <
    K extends
      | "mobilidadeLabios"
      | "mobilidadeLingua"
      | "mobilidadeMandibula"
      | "mobilidadeBochechas",
  >(
    group: K,
    key: string,
    value: number | null
  ) =>
    setForm((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));

  return (
    <FonoAssessmentShell
      title="AMIOFE"
      description="Protocolo de Avaliação Miofuncional Orofacial com Escores."
      instrument={AMIOFE_INSTRUMENT}
      patients={patients}
      getFilledCount={() => countAmiofeFilledFields(form)}
      getFormData={() => form as unknown as Record<string, unknown>}
      getTotalScore={() => sumAmiofeScores(form)}
    >
      {() => (
        <div className="space-y-4">
          <SectionCard title="Aparência e condição postural">
            <div className="grid gap-3 md:grid-cols-2">
              <ScoreSelect
                label="Lábios"
                value={form.aparencia.labios}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("labios", value)}
              />
              <ScoreSelect
                label="Mandíbula"
                value={form.aparencia.mandibula}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("mandibula", value)}
              />
              <ScoreSelect
                label="Bochechas"
                value={form.aparencia.bochechas}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("bochechas", value)}
              />
              <ScoreSelect
                label="Simetria facial"
                value={form.aparencia.simetriaFacial}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("simetriaFacial", value)}
              />
              <ScoreSelect
                label="Posição da língua"
                value={form.aparencia.posicaoLingua}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("posicaoLingua", value)}
              />
              <ScoreSelect
                label="Palato duro"
                value={form.aparencia.palatoDuro}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setAparencia("palatoDuro", value)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Mobilidade — lábios">
            <div className="grid gap-3 md:grid-cols-2">
              {AMIOFE_MOBILIDADE_LABIOS.map((item) => (
                <ScoreSelect
                  key={item.key}
                  label={item.label}
                  value={form.mobilidadeLabios[item.key]}
                  options={AMIOFE_SCORE_3_2_1}
                  onChange={(value) => setMob("mobilidadeLabios", item.key, value)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Mobilidade — língua">
            <div className="grid gap-3 md:grid-cols-2">
              {AMIOFE_MOBILIDADE_LINGUA.map((item) => (
                <ScoreSelect
                  key={item.key}
                  label={item.label}
                  value={form.mobilidadeLingua[item.key]}
                  options={AMIOFE_SCORE_3_2_1}
                  onChange={(value) => setMob("mobilidadeLingua", item.key, value)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Mobilidade — mandíbula">
            <div className="grid gap-3 md:grid-cols-2">
              {AMIOFE_MOBILIDADE_MANDIBULA.map((item) => (
                <ScoreSelect
                  key={item.key}
                  label={item.label}
                  value={form.mobilidadeMandibula[item.key]}
                  options={AMIOFE_SCORE_3_2_1}
                  onChange={(value) =>
                    setMob("mobilidadeMandibula", item.key, value)
                  }
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Mobilidade — bochechas">
            <div className="grid gap-3 md:grid-cols-2">
              {AMIOFE_MOBILIDADE_BOCHECHAS.map((item) => (
                <ScoreSelect
                  key={item.key}
                  label={item.label}
                  value={form.mobilidadeBochechas[item.key]}
                  options={AMIOFE_SCORE_3_2_1}
                  onChange={(value) =>
                    setMob("mobilidadeBochechas", item.key, value)
                  }
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Funções — respiração, deglutição e mastigação">
            <div className="grid gap-3 md:grid-cols-2">
              <ScoreSelect
                label="Respiração"
                value={form.funcoes.respiracao}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("respiracao", value)}
              />
              <ScoreSelect
                label="Deglutição — lábios"
                value={form.funcoes.degluticaoLabios}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("degluticaoLabios", value)}
              />
              <ScoreSelect
                label="Deglutição — língua"
                value={form.funcoes.degluticaoLingua}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("degluticaoLingua", value)}
              />
              <ScoreSelect
                label="Deglutição — sinais"
                value={form.funcoes.degluticaoSinais}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("degluticaoSinais", value)}
              />
              <ScoreSelect
                label="Eficiência sólido"
                value={form.funcoes.degluticaoEficienciaSolido}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) =>
                  setFuncao("degluticaoEficienciaSolido", value)
                }
              />
              <ScoreSelect
                label="Eficiência líquido"
                value={form.funcoes.degluticaoEficienciaLiquido}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) =>
                  setFuncao("degluticaoEficienciaLiquido", value)
                }
              />
              <ScoreSelect
                label="Mastigação — mordida"
                value={form.funcoes.mastigacaoMordida}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("mastigacaoMordida", value)}
              />
              <ScoreSelect
                label="Mastigação — trituração"
                value={form.funcoes.mastigacaoTrituracao}
                options={AMIOFE_MASTIGACAO_TRITURACAO}
                onChange={(value) => setFuncao("mastigacaoTrituracao", value)}
              />
              <ScoreSelect
                label="Mastigação — sinais"
                value={form.funcoes.mastigacaoSinais}
                options={AMIOFE_SCORE_3_2_1}
                onChange={(value) => setFuncao("mastigacaoSinais", value)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Observações">
            <div className="grid gap-3">
              <NotesField
                id="amiofe-alimento"
                label="Alimento utilizado"
                value={form.alimentoUtilizado}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, alimentoUtilizado: value }))
                }
                rows={2}
              />
              <NotesField
                id="amiofe-tempo"
                label="Tempo gasto para ingerir"
                value={form.tempoIngestao}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, tempoIngestao: value }))
                }
                rows={2}
              />
              <NotesField
                id="amiofe-oclusao"
                label="Avaliação funcional da oclusão / ATM"
                value={form.oclusaoNotas}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, oclusaoNotas: value }))
                }
              />
              <NotesField
                id="amiofe-obs"
                label="Observações gerais"
                value={form.observacoes}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, observacoes: value }))
                }
              />
            </div>
          </SectionCard>
        </div>
      )}
    </FonoAssessmentShell>
  );
}
