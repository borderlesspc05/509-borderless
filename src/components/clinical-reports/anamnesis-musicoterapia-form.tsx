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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  createEmptyAnamnesisMusicoterapiaFormData,
  MUSICOTERAPIA_FOCUS_OPTIONS,
  type AnamnesisMusicoterapiaFormData,
} from "@/lib/anamnesis-musicoterapia";

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function YesNoField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || null}
        items={[
          { label: "Sim", value: "sim" },
          { label: "Não", value: "nao" },
        ]}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger id={id} className="h-10 w-full">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sim">Sim</SelectItem>
          <SelectItem value="nao">Não</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function AnamnesisMusicoterapiaForm({
  patientId,
  onSuccess,
}: {
  patientId: string;
  onSuccess?: () => void;
}) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<AnamnesisMusicoterapiaFormData>(
    createEmptyAnamnesisMusicoterapiaFormData
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "musicoterapia",
        formData: form,
      });

      if (result.success) {
        toast.success({
          title: "Anamnese salva",
          description: "Anamnese de Musicoterapia registrada.",
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
      <SectionCard title="Identificação / admissão">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="mt-admission"
            label="Data de admissão (1ª avaliação)"
            value={form.admissionDate}
            onChange={(value) => setForm((prev) => ({ ...prev, admissionDate: value }))}
          />
          <Field
            id="mt-reference"
            label="Pessoa de referência (mãe/pai)"
            value={form.referencePerson}
            onChange={(value) => setForm((prev) => ({ ...prev, referencePerson: value }))}
          />
          <Field
            id="mt-entrevistado"
            label="Nome do entrevistado"
            value={form.interviewedName}
            onChange={(value) => setForm((prev) => ({ ...prev, interviewedName: value }))}
          />
          <Field
            id="mt-relacao"
            label="Relação com o paciente"
            value={form.interviewedRelation}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, interviewedRelation: value }))
            }
          />
          <Field
            id="mt-phone"
            label="Telefone"
            value={form.phone}
            onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Dados clínicos">
        <NotesField
          id="mt-gestacao"
          label="Condições da gestação"
          value={form.clinical.gestation}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              clinical: { ...prev.clinical, gestation: value },
            }))
          }
        />
        <div className="space-y-2">
          <Label htmlFor="mt-parto">Condições do parto</Label>
          <Select
            value={form.clinical.birthType || null}
            items={[
              { label: "Normal", value: "normal" },
              { label: "Cesariana", value: "cesariana" },
            ]}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                clinical: { ...prev.clinical, birthType: value ?? "" },
              }))
            }
          >
            <SelectTrigger id="mt-parto" className="h-10 w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="cesariana">Cesariana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NotesField
          id="mt-doencas"
          label="Doenças infantis"
          value={form.clinical.childhoodIllnesses}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              clinical: { ...prev.clinical, childhoodIllnesses: value },
            }))
          }
        />
        <NotesField
          id="mt-vivencias-gest"
          label="Vivências musicais/sonoras na gestação"
          value={form.clinical.musicalExperiencesGestation}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              clinical: { ...prev.clinical, musicalExperiencesGestation: value },
            }))
          }
        />
        <NotesField
          id="mt-vivencias-pos"
          label="Primeiras vivências musicais/sonoras pós-nascimento"
          value={form.clinical.musicalExperiencesBirth}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              clinical: { ...prev.clinical, musicalExperiencesBirth: value },
            }))
          }
        />
      </SectionCard>

      <SectionCard title="Informações gerais">
        <NotesField
          id="mt-dx"
          label="Diagnóstico atual"
          value={form.general.diagnosis}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, diagnosis: value },
            }))
          }
        />
        <Field
          id="mt-dx-source"
          label="Quem forneceu o diagnóstico"
          value={form.general.diagnosisSource}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, diagnosisSource: value },
            }))
          }
        />
        <NotesField
          id="mt-med"
          label="Medicação"
          value={form.general.medication}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, medication: value },
            }))
          }
        />
        <NotesField
          id="mt-alergia"
          label="Alergia ou sensibilidade"
          value={form.general.allergy}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, allergy: value },
            }))
          }
        />
        <NotesField
          id="mt-seguranca"
          label="Preocupações de segurança (convulsão, mordidas, autoagressão…)"
          value={form.general.safetyConcerns}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, safetyConcerns: value },
            }))
          }
        />
        <NotesField
          id="mt-terapias"
          label="Terapias anteriores / atuais"
          value={form.general.therapies}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, therapies: value },
            }))
          }
        />
        <NotesField
          id="mt-aversao"
          label="Aversões"
          value={form.general.aversions}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, aversions: value },
            }))
          }
        />
        <NotesField
          id="mt-hiperfoco"
          label="Hiperfoco"
          value={form.general.hyperfocus}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, hyperfocus: value },
            }))
          }
        />
        <NotesField
          id="mt-queixa"
          label="Entendimento sobre Musicoterapia e queixa principal"
          value={form.general.understandingAndComplaint}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              general: { ...prev.general, understandingAndComplaint: value },
            }))
          }
        />
      </SectionCard>

      <SectionCard title="Referência musical">
        <NotesField
          id="mt-pref"
          label="Preferências / recusas musicais dos responsáveis"
          value={form.musical.caregiverPreferences}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, caregiverPreferences: value },
            }))
          }
        />
        <NotesField
          id="mt-exp"
          label="Experiência ou exposição com a música"
          value={form.musical.experience}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, experience: value },
            }))
          }
        />
        <YesNoField
          id="mt-gosta"
          label="Gosta de ouvir música?"
          value={form.musical.likesListening}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, likesListening: value },
            }))
          }
        />
        <NotesField
          id="mt-instr"
          label="Instrumentos musicais em casa"
          value={form.musical.instrumentsAtHome}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, instrumentsAtHome: value },
            }))
          }
        />
        <NotesField
          id="mt-freq"
          label="Frequência e meio (rádio, TV, celular, tablet)"
          value={form.musical.listeningFrequency}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, listeningFrequency: value },
            }))
          }
        />
        <NotesField
          id="mt-estilo"
          label="Estilo / cantor favorito"
          value={form.musical.styleFavorite}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, styleFavorite: value },
            }))
          }
        />
        <NotesField
          id="mt-reacao"
          label="Como fica ao ouvir música"
          value={form.musical.reactionWhenListening}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, reactionWhenListening: value },
            }))
          }
        />
        <YesNoField
          id="mt-tocou"
          label="Já tocou algum instrumento?"
          value={form.musical.playedInstrument}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, playedInstrument: value },
            }))
          }
        />
        <NotesField
          id="mt-familia"
          label="Músicos na família"
          value={form.musical.musiciansInFamily}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              musical: { ...prev.musical, musiciansInFamily: value },
            }))
          }
        />
      </SectionCard>

      <SectionCard title="Motricidade ampla e fina">
        {(
          [
            ["grossRestriction", "Restrição de movimentos amplos"],
            ["walksWell", "É capaz de andar perfeitamente?"],
            ["physicalAssistance", "Requer assistência física?"],
            ["usesAllLimbs", "Utiliza plenamente todos os membros?"],
            ["floorComfort", "Confortável em movimentos / sentar no chão?"],
            ["fineRestriction", "Restrição de motricidade fina?"],
            ["bilateralFineTasks", "Tarefas bilaterais finas?"],
            ["holdingObjects", "Dificuldade em manter objetos seguros?"],
          ] as const
        ).map(([key, label]) => (
          <NotesField
            key={key}
            id={`mt-motor-${key}`}
            label={label}
            value={form.motor[key]}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                motor: { ...prev.motor, [key]: value },
              }))
            }
          />
        ))}
      </SectionCard>

      <SectionCard title="Oral">
        {(
          [
            ["verbalStatus", "Verbal / não verbal"],
            ["speechProcessing", "Processamento da fala"],
            ["speechOnsetAge", "Idade de início da fala"],
            ["foodRestriction", "Restrição alimentar"],
            ["breathingIssues", "Problemas respiratórios"],
          ] as const
        ).map(([key, label]) => (
          <NotesField
            key={key}
            id={`mt-oral-${key}`}
            label={label}
            value={form.oral[key]}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                oral: { ...prev.oral, [key]: value },
              }))
            }
          />
        ))}
      </SectionCard>

      <SectionCard title="Sensorial">
        {(
          [
            ["auditoryHypersensitivity", "Hipersensibilidade auditiva"],
            ["sensoryLoss", "Perda sensorial"],
            ["physicalContactRestriction", "Restrição a contato físico"],
            ["overstimulation", "Superestimulação (sons/luzes/multidões)"],
          ] as const
        ).map(([key, label]) => (
          <NotesField
            key={key}
            id={`mt-sens-${key}`}
            label={label}
            value={form.sensory[key]}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                sensory: { ...prev.sensory, [key]: value },
              }))
            }
          />
        ))}
      </SectionCard>

      <SectionCard title="Emocional">
        {(
          [
            ["difficulties", "Dificuldades emocionais"],
            ["expression", "Expressão de emoções"],
            ["dysregulation", "Descontrole / irritabilidade"],
            ["trauma", "Trauma / mudanças significativas"],
            ["emotionalDiagnosis", "Diagnóstico emocional"],
          ] as const
        ).map(([key, label]) => (
          <NotesField
            key={key}
            id={`mt-emo-${key}`}
            label={label}
            value={form.emotional[key]}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                emotional: { ...prev.emotional, [key]: value },
              }))
            }
          />
        ))}
      </SectionCard>

      <SectionCard title="Social">
        {(
          [
            ["siblings", "Irmãos"],
            ["primaryCaregiver", "Com quem fica a maior parte do tempo"],
            ["socialDifficulties", "Dificuldades sociais"],
            ["groups", "Participação em grupos"],
            ["significantIssues", "Questões familiares / escola / amigos"],
          ] as const
        ).map(([key, label]) => (
          <NotesField
            key={key}
            id={`mt-soc-${key}`}
            label={label}
            value={form.social[key]}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                social: { ...prev.social, [key]: value },
              }))
            }
          />
        ))}
      </SectionCard>

      <SectionCard title="Fechamento e plano">
        <NotesField
          id="mt-else"
          label="Algo que não foi abordado?"
          value={form.closing.anythingElse}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              closing: { ...prev.closing, anythingElse: value },
            }))
          }
        />
        <NotesField
          id="mt-obs"
          label="Observações do musicoterapeuta"
          value={form.closing.therapistNotes}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              closing: { ...prev.closing, therapistNotes: value },
            }))
          }
        />
        <NotesField
          id="mt-plano"
          label="Plano sugerido"
          value={form.closing.suggestedPlan}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              closing: { ...prev.closing, suggestedPlan: value },
            }))
          }
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Categorias de foco das intervenções</p>
          <CheckboxGroup
            options={MUSICOTERAPIA_FOCUS_OPTIONS}
            values={form.closing.focusCategories}
            onChange={(key, checked) =>
              setForm((prev) => ({
                ...prev,
                closing: {
                  ...prev.closing,
                  focusCategories: {
                    ...prev.closing.focusCategories,
                    [key]: checked,
                  },
                },
              }))
            }
            columns={2}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          <Save className="size-4" aria-hidden />
          {isPending ? "Salvando..." : "Salvar anamnese de Musicoterapia"}
        </Button>
      </div>
    </form>
  );
}
