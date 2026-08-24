"use client";

import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";

export const nutritionInputClassName = "h-11 w-full";
export const nutritionTextareaClassName =
  "min-h-36 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type NutritionSectionCardProps = {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export function NutritionSectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  action,
}: NutritionSectionCardProps) {
  return (
    <Card className={cn("app-surface-card overflow-hidden", className)}>
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {Icon ? <Icon className="size-4 text-primary" aria-hidden /> : null}
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="max-w-2xl leading-relaxed">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">{children}</CardContent>
    </Card>
  );
}

type NutritionFieldGroupProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
};

export function NutritionFieldGroup({
  title,
  description,
  children,
  columns = 3,
}: NutritionFieldGroupProps) {
  const gridClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4 sm:p-5">
      <div className="space-y-1">
        <SectionTitle as="h3">{title}</SectionTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className={cn("grid gap-4", gridClass)}>{children}</div>
    </section>
  );
}

type NutritionStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
};

export function NutritionStatCard({
  label,
  value,
  hint,
  accent = false,
}: NutritionStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        accent
          ? "border-primary/20 bg-primary/5"
          : "border-border/70 bg-background"
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type NutritionFormFooterProps = {
  children: React.ReactNode;
  hint?: string;
};

export function NutritionFormFooter({ children, hint }: NutritionFormFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm">
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : <span />}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

type NutritionHistoryItemProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export function NutritionHistoryItem({
  title,
  subtitle,
  badge,
  children,
  actions,
}: NutritionHistoryItemProps) {
  return (
    <article className="rounded-xl border border-border/70 bg-background p-4 transition-colors hover:bg-muted/20">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-foreground">{title}</h4>
            {badge ? (
              <Badge variant="secondary" className="font-normal">
                {badge}
              </Badge>
            ) : null}
          </div>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {children}
    </article>
  );
}

type NutritionTemplatePickerProps = {
  templates: { id: string; title: string; conditionTag?: string | null }[];
  onSelect: (id: string) => void;
};

export function NutritionTemplatePicker({
  templates,
  onSelect,
}: NutritionTemplatePickerProps) {
  if (templates.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionTitle as="h3">Biblioteca de modelos</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className="rounded-xl border border-border/70 bg-background px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-sm font-medium text-foreground">{template.title}</p>
            {template.conditionTag ? (
              <p className="mt-1 text-xs text-muted-foreground capitalize">
                {template.conditionTag}
              </p>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NutritionMacroSummary({
  caloriesKcal,
  carbsG,
  proteinG,
  fatG,
}: {
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
}) {
  const items = [
    { label: "Calorias", value: `${caloriesKcal.toFixed(0)} kcal`, accent: true },
    { label: "Carboidratos", value: `${carbsG.toFixed(1)} g` },
    { label: "Proteínas", value: `${proteinG.toFixed(1)} g` },
    { label: "Gorduras", value: `${fatG.toFixed(1)} g` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <NutritionStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          accent={item.accent}
        />
      ))}
    </div>
  );
}

export function NutritionPromptChips({
  prompts,
  onSelect,
}: {
  prompts: string[];
  onSelect: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="outline"
          size="sm"
          className="h-auto whitespace-normal px-3 py-1.5 text-left text-xs font-normal"
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}

export function formatEnergyResult(result: Record<string, unknown>) {
  const entries: { label: string; value: string; accent?: boolean }[] = [];

  if ("formulaLabel" in result && result.formulaLabel) {
    entries.push({ label: "Fórmula", value: String(result.formulaLabel) });
  }
  if ("formula" in result && result.formula) {
    entries.push({ label: "Fórmula", value: String(result.formula) });
  }
  if ("bmr" in result && result.bmr != null) {
    entries.push({ label: "TMB", value: `${result.bmr} kcal/dia` });
  }
  if ("eer" in result && result.eer != null) {
    entries.push({
      label: "EER",
      value: `${result.eer} kcal/dia`,
      accent: !("total" in result) && !("get" in result),
    });
  }
  if ("get" in result && result.get != null) {
    entries.push({ label: "GET", value: `${result.get} kcal/dia`, accent: true });
  }
  if ("trimesterBonus" in result && Number(result.trimesterBonus) > 0) {
    entries.push({
      label: "Acréscimo gestacional",
      value: `+${result.trimesterBonus} kcal`,
    });
  }
  if ("total" in result && result.total != null) {
    entries.push({
      label: "Necessidade total",
      value: `${result.total} kcal/dia`,
      accent: true,
    });
  }

  return entries;
}
