"use client";

import {
  Apple,
  Calculator,
  ClipboardList,
  FileText,
  Pill,
  Ruler,
  UtensilsCrossed,
} from "lucide-react";

import { NutritionAnamnesisSection } from "@/components/nutrition/nutrition-anamnesis-section";
import { NutritionAnthropometrySection } from "@/components/nutrition/nutrition-anthropometry-section";
import { NutritionDocumentsSection } from "@/components/nutrition/nutrition-documents-section";
import { NutritionEnergySection } from "@/components/nutrition/nutrition-energy-section";
import { NutritionMealPlanSection } from "@/components/nutrition/nutrition-meal-plan-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PatientNutritionTabProps = {
  patientId: string;
  patientName: string;
  patientBirthDate?: string | null;
  professionalName: string;
  professionalRole: string;
  readOnly?: boolean;
};

const NUTRITION_TABS = [
  { value: "anamnese", label: "Anamnese", icon: ClipboardList },
  { value: "antropometria", label: "Antropometria", icon: Ruler },
  { value: "energia", label: "Energia", icon: Calculator },
  { value: "plano", label: "Plano alimentar", icon: UtensilsCrossed },
  { value: "orientacoes", label: "Orientações", icon: FileText },
  { value: "prescricoes", label: "Manipulados", icon: Pill },
] as const;

export function PatientNutritionTab({
  patientId,
  patientName,
  patientBirthDate,
  professionalName,
  professionalRole,
  readOnly = false,
}: PatientNutritionTabProps) {
  return (
    <div className="space-y-5">
      <div className="app-surface-card flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Apple className="size-5 text-primary" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Nutrição — {patientName}
            </h2>
            <p className="mt-0.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Anamnese, medidas, cálculos energéticos, plano alimentar, orientações e
              prescrições em um fluxo clínico contínuo.
            </p>
          </div>
        </div>
        {readOnly ? (
          <span className="inline-flex w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Somente leitura
          </span>
        ) : null}
      </div>

      <Tabs defaultValue="anamnese" className="gap-4">
        <TabsList className="mb-1 h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1 [&_[data-slot=tabs-trigger]]:shrink-0 [&_[data-slot=tabs-trigger]]:flex-none">
          {NUTRITION_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn("gap-1.5 px-3 py-2 text-xs sm:text-sm")}
            >
              <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="anamnese" className="mt-0 space-y-4">
          <NutritionAnamnesisSection patientId={patientId} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="antropometria" className="mt-0 space-y-4">
          <NutritionAnthropometrySection
            patientId={patientId}
            patientBirthDate={patientBirthDate}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="energia" className="mt-0 space-y-4">
          <NutritionEnergySection patientId={patientId} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="plano" className="mt-0 space-y-4">
          <NutritionMealPlanSection patientId={patientId} readOnly={readOnly} />
        </TabsContent>

        <TabsContent value="orientacoes" className="mt-0 space-y-4">
          <NutritionDocumentsSection
            kind="orientation"
            patientId={patientId}
            patientName={patientName}
            professionalName={professionalName}
            professionalRole={professionalRole}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="prescricoes" className="mt-0 space-y-4">
          <NutritionDocumentsSection
            kind="prescription"
            patientId={patientId}
            patientName={patientName}
            professionalName={professionalName}
            professionalRole={professionalRole}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
