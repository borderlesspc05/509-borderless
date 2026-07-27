"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { saveDiccaoEvaluationAction } from "@/app/actions/diccao-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppToast } from "@/hooks/use-app-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { toDateKey } from "@/lib/calendar-utils";
import {
  getClinicalPatient,
  type ClinicalPatient,
} from "@/lib/clinical-evolution-data";
import {
  ARTICULACAO_OBSERVACAO_OPTIONS,
  countDiccaoFilledFields,
  createEmptyDiccaoFormData,
  DIADOCOCINESIA_OPTIONS,
  DICCAO_INSTRUMENT,
  INTENSIDADE_VOCAL_OPTIONS,
  MOBILIDADE_LABIOS_ITEMS,
  MOBILIDADE_LINGUA_ITEMS,
  MOBILIDADE_SCALE,
  type DiccaoFormData,
  type MobilidadeScore,
} from "@/lib/diccao";
import { ASSESSMENT_APPLY_HUB_HREF } from "@/lib/assessment-apply-routes";

type DiccaoApplicationPageViewProps = {
  patients: ClinicalPatient[];
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CheckboxOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 rounded border-input"
      />
      <span>{label}</span>
    </label>
  );
}

function MobilidadeGrid({
  items,
  values,
  onChange,
}: {
  items: readonly { key: string; label: string }[];
  values: Record<string, MobilidadeScore | null>;
  onChange: (key: string, value: MobilidadeScore | null) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="grid gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center"
        >
          <p className="text-sm text-foreground">{item.label}</p>
          <Select
            value={values[item.key] == null ? "__none__" : String(values[item.key])}
            onValueChange={(next) => {
              if (!next || next === "__none__") {
                onChange(item.key, null);
                return;
              }
              onChange(item.key, Number(next) as MobilidadeScore);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="__none__">Não informado</SelectItem>
                {MOBILIDADE_SCALE.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.value} — {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

export function DiccaoApplicationPageView({
  patients,
}: DiccaoApplicationPageViewProps) {
  const { userName, displayRole } = useUserRole();
  const toast = useAppToast();

  const activePatients = patients.filter((patient) => patient.id);
  const [patientId, setPatientId] = useState(activePatients[0]?.id ?? "");
  const [evaluationDate, setEvaluationDate] = useState(toDateKey(new Date()));
  const [formData, setFormData] = useState<DiccaoFormData>(createEmptyDiccaoFormData);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPatient = getClinicalPatient(activePatients, patientId);
  const filledCount = countDiccaoFilledFields(formData);

  async function handleSave(status: "draft" | "finalized") {
    if (!selectedPatient) {
      toast.error({ title: "Selecione um paciente." });
      return;
    }

    if (filledCount === 0) {
      toast.error({
        title: "Formulário vazio",
        description: "Preencha ao menos um campo antes de salvar.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveDiccaoEvaluationAction({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        evaluationDate,
        formData,
        professionalName: userName || "Profissional",
        professionalRole: displayRole || "Fonoaudiólogo",
        status,
      });

      if (!result.success) {
        toast.error({
          title: "Falha ao salvar",
          description: result.error ?? "Não foi possível salvar a avaliação.",
        });
        return;
      }

      toast.success({
        title:
          status === "finalized"
            ? "Avaliação da Dicção finalizada."
            : "Rascunho da Avaliação da Dicção salvo.",
      });

      if (status === "finalized") {
        setFormData(createEmptyDiccaoFormData());
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title={DICCAO_INSTRUMENT}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Evolução" },
          { label: "Avaliações", href: ASSESSMENT_APPLY_HUB_HREF },
          { label: "Dicção" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          nativeButton={false}
          render={<Link href={ASSESSMENT_APPLY_HUB_HREF} />}
        >
          <ArrowLeft className="size-4" />
          Voltar às avaliações
        </Button>
        <p className="text-sm text-muted-foreground">
          {filledCount} campo(s) preenchido(s)
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-border/80 bg-card p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Paciente</Label>
          <Select
            value={patientId}
            onValueChange={(value) => {
              if (value) setPatientId(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {activePatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="diccao-date">Data da avaliação</Label>
          <Input
            id="diccao-date"
            type="date"
            value={evaluationDate}
            onChange={(event) => setEvaluationDate(event.target.value)}
          />
        </div>
      </div>

      <SectionCard
        title="I — Articulação"
        description="Movimentos labiais e observações qualitativas."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Dizer /u/, /i/ 5 vezes seguidas (segundos)</Label>
            <Input
              value={formData.articulacao.uiRepeticoesSegundos}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  articulacao: {
                    ...prev.articulacao,
                    uiRepeticoesSegundos: event.target.value,
                  },
                }))
              }
              placeholder="Ex.: 5"
            />
          </div>
          <div className="space-y-2">
            <Label>Dizer /p/ 5 vezes seguidas (segundos)</Label>
            <Input
              value={formData.articulacao.pRepeticoesSegundos}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  articulacao: {
                    ...prev.articulacao,
                    pRepeticoesSegundos: event.target.value,
                  },
                }))
              }
              placeholder="Ex.: 5"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ARTICULACAO_OBSERVACAO_OPTIONS.map((option) => (
            <CheckboxOption
              key={option.key}
              checked={formData.articulacao.observacoes[option.key]}
              label={option.label}
              onChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  articulacao: {
                    ...prev.articulacao,
                    observacoes: {
                      ...prev.articulacao.observacoes,
                      [option.key]: checked,
                    },
                  },
                }))
              }
            />
          ))}
        </div>
        <div className="space-y-2">
          <Label>Outras observações</Label>
          <Textarea
            value={formData.articulacao.outrasObservacoes}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                articulacao: {
                  ...prev.articulacao,
                  outrasObservacoes: event.target.value,
                },
              }))
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="II — Intensidade vocal">
        <div className="flex flex-wrap gap-4">
          {INTENSIDADE_VOCAL_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="intensidade-vocal"
                checked={formData.intensidadeVocal === option.value}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    intensidadeVocal: option.value,
                  }))
                }
                className="size-4 border-input"
              />
              {option.label}
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="III — Tempo máximo de fonação"
        description="Referência usual: 10 a 20 segundos."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["a", "i", "s", "z"] as const).map((sound) => (
            <div key={sound} className="space-y-2">
              <Label>/{sound}/ (segundos)</Label>
              <Input
                value={formData.tempoMaximoFonacao[sound]}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    tempoMaximoFonacao: {
                      ...prev.tempoMaximoFonacao,
                      [sound]: event.target.value,
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="IV — Diadocinesia"
        description="Emitir /papapa/, /tatata/, /kakaka/ e /pataka/ o mais longo e rápido possível."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {DIADOCOCINESIA_OPTIONS.map((option) => (
            <CheckboxOption
              key={option.key}
              checked={formData.diadocinesia[option.key]}
              label={option.label}
              onChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  diadocinesia: {
                    ...prev.diadocinesia,
                    [option.key]: checked,
                  },
                }))
              }
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="V — Fala automática"
        description="Contar de 1 a 20, dias da semana e meses do ano."
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Omissão</Label>
            <Textarea
              value={formData.falaAutomatica.omissao}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  falaAutomatica: {
                    ...prev.falaAutomatica,
                    omissao: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Substituição</Label>
            <Textarea
              value={formData.falaAutomatica.substituicao}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  falaAutomatica: {
                    ...prev.falaAutomatica,
                    substituicao: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Distorção</Label>
            <Textarea
              value={formData.falaAutomatica.distorcao}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  falaAutomatica: {
                    ...prev.falaAutomatica,
                    distorcao: event.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="VI — Mobilidade (lábios)"
        description="0 Adequado · 1 Pequena alteração · 2 Grande alteração · 3 Ausente"
      >
        <MobilidadeGrid
          items={MOBILIDADE_LABIOS_ITEMS}
          values={formData.mobilidadeLabios}
          onChange={(key, value) =>
            setFormData((prev) => ({
              ...prev,
              mobilidadeLabios: {
                ...prev.mobilidadeLabios,
                [key]: value,
              },
            }))
          }
        />
      </SectionCard>

      <SectionCard
        title="VI — Mobilidade (língua)"
        description="0 Adequado · 1 Pequena alteração · 2 Grande alteração · 3 Ausente"
      >
        <MobilidadeGrid
          items={MOBILIDADE_LINGUA_ITEMS}
          values={formData.mobilidadeLingua}
          onChange={(key, value) =>
            setFormData((prev) => ({
              ...prev,
              mobilidadeLingua: {
                ...prev.mobilidadeLingua,
                [key]: value,
              },
            }))
          }
        />
      </SectionCard>

      <SectionCard title="VII — Trava-línguas e poemas">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Comprei poucas capas pretas práticas perto da praça Petrópolis
              (10–20s)
            </Label>
            <Input
              value={formData.travaLinguas.capasPretas}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    capasPretas: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>
              O Rei de Roma ruma rápido à Roraima… (10–20s)
            </Label>
            <Input
              value={formData.travaLinguas.reiDeRoma}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    reiDeRoma: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>
              A chave do chefe Chaves está no chaveiro (10–20s)
            </Label>
            <Input
              value={formData.travaLinguas.chaveChaves}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    chaveChaves: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Casa suja, chão sujo… (5× / 10s)</Label>
              <Input
                value={formData.travaLinguas.casaSuja}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    travaLinguas: {
                      ...prev.travaLinguas,
                      casaSuja: event.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Com fé, vou a pé à Sé (5× / 10s)</Label>
              <Input
                value={formData.travaLinguas.comFe}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    travaLinguas: {
                      ...prev.travaLinguas,
                      comFe: event.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Poema 1 — “Baste a quem baste…” (10s)</Label>
            <Input
              value={formData.travaLinguas.poemaBaste}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    poemaBaste: event.target.value,
                  },
                }))
              }
            />
            <Textarea
              value={formData.travaLinguas.poemaBasteObs}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    poemaBasteObs: event.target.value,
                  },
                }))
              }
              placeholder="Observações do poema 1"
            />
          </div>
          <div className="space-y-2">
            <Label>Poema 2 — “Valeu a pena?…” (10s)</Label>
            <Input
              value={formData.travaLinguas.poemaValeu}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    poemaValeu: event.target.value,
                  },
                }))
              }
            />
            <Textarea
              value={formData.travaLinguas.poemaValeuObs}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  travaLinguas: {
                    ...prev.travaLinguas,
                    poemaValeuObs: event.target.value,
                  },
                }))
              }
              placeholder="Observações do poema 2"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Observações gerais">
        <Textarea
          value={formData.observacoesGerais}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              observacoesGerais: event.target.value,
            }))
          }
          rows={4}
          placeholder="Registros adicionais da avaliação..."
        />
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          className="gap-2"
          onClick={() => void handleSave("draft")}
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Salvar rascunho
        </Button>
        <Button
          type="button"
          disabled={isSaving}
          className="gap-2"
          onClick={() => void handleSave("finalized")}
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Finalizar avaliação
        </Button>
      </div>
    </PageContainer>
  );
}
