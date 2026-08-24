"use client";

import Link from "next/link";
import { Apple, ExternalLink } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import { useState } from "react";

type NutritionPageViewProps = {
  patients: ClinicalPatient[];
};

export function NutritionPageView({ patients }: NutritionPageViewProps) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");

  const selectedPatient = patients.find((patient) => patient.id === patientId);

  return (
    <PageContainer>
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
            Acesse o prontuário do paciente para registrar e acompanhar a evolução.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Acessar prontuário nutricional</CardTitle>
          <CardDescription>
            Selecione o aprendiz para abrir a aba Nutrição no prontuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-[240px] flex-1 space-y-2">
            <label
              htmlFor="nutrition-patient-select"
              className="text-sm font-medium text-muted-foreground"
            >
              Aprendiz
            </label>
            <Select
              value={patientId}
              onValueChange={(value) => setPatientId(value ?? "")}
            >
              <SelectTrigger id="nutrition-patient-select" className="h-11">
                <SelectValue placeholder="Selecione um aprendiz">
                  {selectedPatient?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPatient ? (
            <Button
              className="gap-2"
              nativeButton={false}
              render={
                <Link
                  href={`/paciente/${selectedPatient.id}/prontuario?tab=nutricao`}
                />
              }
            >
              Abrir módulo de nutrição
              <ExternalLink className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
