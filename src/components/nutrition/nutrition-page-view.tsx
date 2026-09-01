"use client";

import Link from "next/link";
import { Apple, Check, ExternalLink, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { PatientNutritionTab } from "@/components/nutrition/patient-nutrition-tab";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { useUserRole } from "@/hooks/use-user-role";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import { cn } from "@/lib/utils";

type NutritionPageViewProps = {
  patients: ClinicalPatient[];
};

type ComboboxPatient = {
  id: string;
  fullName: string;
};

export function NutritionPageView({ patients }: NutritionPageViewProps) {
  const { userName, displayRole } = useUserRole();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [comboboxInput, setComboboxInput] = useState(patients[0]?.name ?? "");

  const comboboxPatients = useMemo<ComboboxPatient[]>(
    () =>
      patients.map((patient) => ({
        id: patient.id,
        fullName: patient.name,
      })),
    [patients]
  );

  const comboboxValue =
    comboboxPatients.find((patient) => patient.id === patientId) ?? null;

  const selectedPatient = patients.find((patient) => patient.id === patientId);

  useEffect(() => {
    const patient = patients.find((item) => item.id === patientId);
    setComboboxInput(patient?.name ?? "");
  }, [patientId, patients]);

  function handlePatientChange(nextPatientId: string) {
    if (!nextPatientId || nextPatientId === patientId) {
      return;
    }

    const patient = patients.find((item) => item.id === nextPatientId);
    setPatientId(nextPatientId);
    setComboboxInput(patient?.name ?? "");
  }

  return (
    <PageContainer size="wide">
      <DashboardPageHeader
        title="Nutrição"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Evolução" },
          { label: "Nutrição" },
        ]}
      />

      <section className="app-surface-card p-4 text-sm text-muted-foreground sm:p-5">
        <div className="flex items-start gap-3">
          <Apple className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p>
            Módulo completo de atendimento nutricional: anamnese, antropometria,
            cálculos energéticos, plano alimentar, orientações e prescrições.
            Selecione o aprendiz abaixo para registrar e acompanhar a evolução.
          </p>
        </div>
      </section>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Selecionar aprendiz</CardTitle>
          <CardDescription>
            Clique no nome do aprendiz ou use a busca para trocar o prontuário
            carregado abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {patients.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
              Nenhum aprendiz ativo cadastrado.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="nutrition-patient-search"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Buscar aprendiz
                </label>
                <Combobox
                  items={comboboxPatients}
                  value={comboboxValue}
                  inputValue={comboboxInput}
                  onInputValueChange={setComboboxInput}
                  onValueChange={(value) => {
                    if (!value) {
                      return;
                    }

                    handlePatientChange(value.id);
                  }}
                  itemToStringLabel={(patient) => patient.fullName}
                  itemToStringValue={(patient) => patient.id}
                  isItemEqualToValue={(item, value) => item.id === value.id}
                >
                  <ComboboxInput
                    id="nutrition-patient-search"
                    placeholder="Digite o nome do aprendiz..."
                    showTrigger
                    className="h-11 w-full"
                  >
                    <InputGroupAddon align="inline-start">
                      <Search className="size-4" aria-hidden />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent className="w-[var(--anchor-width)]">
                    <ComboboxEmpty>Nenhum aprendiz encontrado.</ComboboxEmpty>
                    <ComboboxList>
                      {(patient) => (
                        <ComboboxItem key={patient.id} value={patient}>
                          {patient.fullName}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Aprendizes ativos
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="listbox"
                  aria-label="Aprendizes ativos"
                >
                  {patients.map((patient) => {
                    const isSelected = patient.id === patientId;

                    return (
                      <button
                        key={patient.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handlePatientChange(patient.id)}
                        className={cn(
                          "inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10 font-medium text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <span className="truncate">{patient.name}</span>
                        {isSelected ? (
                          <Check className="size-4 shrink-0" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {selectedPatient ? (
            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button
                variant="outline"
                className="gap-2"
                nativeButton={false}
                render={
                  <Link
                    href={`/paciente/${selectedPatient.id}/prontuario?tab=nutricao`}
                  />
                }
              >
                Ver no prontuário completo
                <ExternalLink className="size-4" />
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedPatient ? (
        <PatientNutritionTab
          key={selectedPatient.id}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          patientBirthDate={selectedPatient.birthDate}
          professionalName={userName || "Profissional"}
          professionalRole={displayRole || "Nutrição"}
        />
      ) : null}
    </PageContainer>
  );
}
