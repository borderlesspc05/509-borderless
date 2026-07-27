"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { saveAnamnesisAction } from "@/app/actions/anamnesis-actions";
import { useAppToast } from "@/hooks/use-app-toast";
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
import {
  ALTERACAO_MUSCULOESQUELETICA_OPTIONS,
  AVD_NIVEL_OPTIONS,
  COMPORTAMENTO_OPTIONS,
  COMPONENTES_MOTORES_OPTIONS,
  DESENVOLVIMENTO_MOTOR_OPTIONS,
  QUALIDADE_OPTIONS,
  createEmptyAnamnesisFisioterapiaFormData,
  type AnamnesisFisioterapiaFormData,
} from "@/lib/anamnesis-fisioterapia";

function CheckboxGroup({
  title,
  options,
  values,
  onChange,
}: {
  title: string;
  options: readonly { key: string; label: string }[];
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label key={option.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(values[option.key])}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="size-4 rounded border-input"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function NivelSelect({
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
      <Select value={value || "__none__"} onValueChange={(next) => onChange(next === "__none__" ? "" : (next ?? ""))}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {AVD_NIVEL_OPTIONS.map((option) => (
              <SelectItem
                key={option.value || "__none__"}
                value={option.value || "__none__"}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function QualidadeSelect({
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
      <Select value={value || "__none__"} onValueChange={(next) => onChange(next === "__none__" ? "" : (next ?? ""))}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {QUALIDADE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value || "__none__"}
                value={option.value || "__none__"}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function AnamnesisFisioterapiaForm({
  patientId,
  onSuccess,
}: {
  patientId: string;
  onSuccess?: () => void;
}) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<AnamnesisFisioterapiaFormData>(
    createEmptyAnamnesisFisioterapiaFormData
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveAnamnesisAction({
        patientId,
        anamnesisType: "fisioterapia",
        formData,
      });

      if (result.success) {
        toast.success({
          title: "Anamnese salva",
          description: "O formulário de fisioterapia foi registrado com sucesso.",
        });
        onSuccess?.();
      } else {
        toast.error({ title: "Erro", description: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        Para marcar lesões, dor ou outras observações no manequim 3D, use a aba{" "}
        <span className="font-medium text-foreground">Mapa corporal</span> deste
        prontuário.
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Diagnóstico e queixas
        </h3>

        <div className="space-y-2">
          <Label>Diagnóstico e queixa principal</Label>
          <Textarea
            value={formData.diagnosticoQueixaPrincipal}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                diagnosticoQueixaPrincipal: event.target.value,
              }))
            }
            placeholder="Descreva o diagnóstico e a queixa principal..."
          />
        </div>

        <div className="space-y-2">
          <Label>
            Queixa principal funcional (quedas, coordenação, autorregulação
            sensorial)
          </Label>
          <Textarea
            value={formData.queixaFuncional}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                queixaFuncional: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Medicamentos em uso</Label>
          <Input
            value={formData.medicamentos}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                medicamentos: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          História pregressa e saúde
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Idade gestacional</Label>
            <Input
              value={formData.saude.idadeGestacional}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  saude: { ...prev.saude, idadeGestacional: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Peso</Label>
            <Input
              value={formData.saude.peso}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  saude: { ...prev.saude, peso: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Alta junto da mãe?</Label>
            <Input
              value={formData.saude.altaJuntoDaMae}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  saude: { ...prev.saude, altaJuntoDaMae: event.target.value },
                }))
              }
              placeholder="Sim / Não / Observações"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Gestação / parto / puerpério e demais observações</Label>
          <Textarea
            value={formData.saude.historiaPregressa}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                saude: { ...prev.saude, historiaPregressa: event.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <CheckboxGroup
          title="Histórico do desenvolvimento"
          options={DESENVOLVIMENTO_MOTOR_OPTIONS}
          values={formData.desenvolvimento}
          onChange={(key, checked) =>
            setFormData((prev) => ({
              ...prev,
              desenvolvimento: { ...prev.desenvolvimento, [key]: checked },
            }))
          }
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <CheckboxGroup
          title="Alterações musculoesqueléticas"
          options={ALTERACAO_MUSCULOESQUELETICA_OPTIONS}
          values={formData.alteracaoMusculoEsqueletica}
          onChange={(key, checked) =>
            setFormData((prev) => ({
              ...prev,
              alteracaoMusculoEsqueletica: {
                ...prev.alteracaoMusculoEsqueletica,
                [key]: checked,
              },
            }))
          }
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <CheckboxGroup
          title="Componentes de desempenho motores"
          options={COMPONENTES_MOTORES_OPTIONS}
          values={formData.componentesMotores}
          onChange={(key, checked) =>
            setFormData((prev) => ({
              ...prev,
              componentesMotores: {
                ...prev.componentesMotores,
                [key]: checked,
              },
            }))
          }
        />
        <div className="space-y-2">
          <Label>Dominância</Label>
          <Input
            value={formData.dominancia}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                dominancia: event.target.value,
              }))
            }
            placeholder="Ex.: direita, esquerda, indefinida"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Escola</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome da escola</Label>
            <Input
              value={formData.escola.nome}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: { ...prev.escola, nome: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Série</Label>
            <Input
              value={formData.escola.serie}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: { ...prev.escola, serie: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Contraturno</Label>
            <Input
              value={formData.escola.contraturno}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: { ...prev.escola, contraturno: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Queixas</Label>
            <Textarea
              value={formData.escola.queixas}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: { ...prev.escola, queixas: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Atendente terapêutico ou cuidador(a)?</Label>
            <Input
              value={formData.escola.atendenteOuCuidador}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: {
                    ...prev.escola,
                    atendenteOuCuidador: event.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Material adaptado?</Label>
            <Input
              value={formData.escola.materialAdaptado}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  escola: {
                    ...prev.escola,
                    materialAdaptado: event.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Compreensão, imitação e comportamento
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <QualidadeSelect
            id="fisio-compreensao"
            label="Compreensão"
            value={formData.compreensao}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, compreensao: value }))
            }
          />
          <QualidadeSelect
            id="fisio-imitacao"
            label="Imitação motora"
            value={formData.imitacaoMotora}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, imitacaoMotora: value }))
            }
          />
        </div>
        <CheckboxGroup
          title="Comportamento"
          options={COMPORTAMENTO_OPTIONS}
          values={formData.comportamento}
          onChange={(key, checked) =>
            setFormData((prev) => ({
              ...prev,
              comportamento: { ...prev.comportamento, [key]: checked },
            }))
          }
        />
      </div>

      <div className="space-y-5 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">
          Atividades de vida diária
        </h3>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Higiene</p>
          <NivelSelect
            id="avd-higiene"
            label="Nível de independência"
            value={formData.avd.higiene.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  higiene: { ...prev.avd.higiene, nivel: value },
                },
              }))
            }
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.higiene.controleEsfincter}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      higiene: {
                        ...prev.avd.higiene,
                        controleEsfincter: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Controle de esfíncter
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.higiene.pedeBanheiro}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      higiene: {
                        ...prev.avd.higiene,
                        pedeBanheiro: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Pede para ir ao banheiro
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Banho</p>
          <NivelSelect
            id="avd-banho"
            label="Nível de independência"
            value={formData.avd.banho.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  banho: { ...prev.avd.banho, nivel: value },
                },
              }))
            }
          />
          <div className="space-y-2">
            <Label>Postura durante o banho</Label>
            <Input
              value={formData.avd.banho.postura}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  avd: {
                    ...prev.avd,
                    banho: { ...prev.avd.banho, postura: event.target.value },
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Higiene bucal</p>
          <NivelSelect
            id="avd-higiene-bucal"
            label="Nível de independência"
            value={formData.avd.higieneBucal.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  higieneBucal: { ...prev.avd.higieneBucal, nivel: value },
                },
              }))
            }
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.higieneBucal.seguraEscova}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      higieneBucal: {
                        ...prev.avd.higieneBucal,
                        seguraEscova: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Segura escova
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.higieneBucal.escovaDentes}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      higieneBucal: {
                        ...prev.avd.higieneBucal,
                        escovaDentes: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Escova os dentes
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Pentear cabelo</p>
          <NivelSelect
            id="avd-pentear"
            label="Nível de independência"
            value={formData.avd.pentearCabelo.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  pentearCabelo: { ...prev.avd.pentearCabelo, nivel: value },
                },
              }))
            }
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.pentearCabelo.levaPente}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      pentearCabelo: {
                        ...prev.avd.pentearCabelo,
                        levaPente: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Leva pente/escova até o cabelo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.pentearCabelo.desembaraça}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      pentearCabelo: {
                        ...prev.avd.pentearCabelo,
                        desembaraça: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Desembaraça
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.pentearCabelo.amarra}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      pentearCabelo: {
                        ...prev.avd.pentearCabelo,
                        amarra: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Amarra
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Vestuário</p>
          <NivelSelect
            id="avd-vestuario"
            label="Nível de independência"
            value={formData.avd.vestuario.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  vestuario: { ...prev.avd.vestuario, nivel: value },
                },
              }))
            }
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.vestuario.vesteSozinho}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      vestuario: {
                        ...prev.avd.vestuario,
                        vesteSozinho: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Veste-se sozinho
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.avd.vestuario.despeSozinho}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    avd: {
                      ...prev.avd,
                      vestuario: {
                        ...prev.avd.vestuario,
                        despeSozinho: event.target.checked,
                      },
                    },
                  }))
                }
                className="size-4 rounded border-input"
              />
              Despe-se sozinho
            </label>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-medium text-foreground">Alimentação</p>
          <NivelSelect
            id="avd-alimentacao"
            label="Nível de independência"
            value={formData.avd.alimentacao.nivel}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                avd: {
                  ...prev.avd,
                  alimentacao: { ...prev.avd.alimentacao, nivel: value },
                },
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Rotina</h3>
        <div className="space-y-2">
          <Label>Rotina da criança na maioria dos dias</Label>
          <Textarea
            value={formData.rotina.geral}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                rotina: { ...prev.rotina, geral: event.target.value },
              }))
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Acordar</Label>
            <Input
              value={formData.rotina.acordar}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  rotina: { ...prev.rotina, acordar: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Brincar / TV</Label>
            <Input
              value={formData.rotina.brincarTv}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  rotina: { ...prev.rotina, brincarTv: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Sono</Label>
            <Input
              value={formData.rotina.sono}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  rotina: { ...prev.rotina, sono: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tempo diário em telas</Label>
            <Input
              value={formData.rotina.tempoTelas}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  rotina: { ...prev.rotina, tempoTelas: event.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Brincar</Label>
            <Textarea
              value={formData.rotina.brincar}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  rotina: { ...prev.rotina, brincar: event.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">Objetivos</h3>
        <div className="space-y-2">
          <Label>Objetivos e expectativas da família</Label>
          <Textarea
            value={formData.objetivosFamilia}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                objetivosFamilia: event.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>
            Principais déficits-alvo / objetivos funcionais mensuráveis
          </Label>
          <Textarea
            value={formData.objetivosFuncionais}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                objetivosFuncionais: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          <Save className="size-4" />
          {isPending ? "Salvando..." : "Salvar anamnese"}
        </Button>
      </div>
    </form>
  );
}
