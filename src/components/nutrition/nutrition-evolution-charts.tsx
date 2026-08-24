"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { NutritionAnthropometryRecord } from "@/lib/nutrition/types";
import type { AdultAnthropometryData, ChildAnthropometryData } from "@/lib/nutrition/types";
import { formatPatientDate } from "@/lib/patient-format";

type NutritionEvolutionChartsProps = {
  records: NutritionAnthropometryRecord[];
};

function buildAdultPoints(records: NutritionAnthropometryRecord[]) {
  return records
    .filter((record) => record.recordType === "adult")
    .map((record) => {
      const data = record.formData as AdultAnthropometryData;
      return {
        dateLabel: formatPatientDate(record.consultationDate),
        weight: data.weightKg,
        bmi: data.bmi,
        fatPercent: data.bioimpedance.fatPercent,
        waist: data.measurements.waistCm,
      };
    })
    .filter((point) => point.weight !== null);
}

function buildChildPoints(records: NutritionAnthropometryRecord[]) {
  return records
    .filter((record) => record.recordType === "child")
    .map((record) => {
      const data = record.formData as ChildAnthropometryData;
      return {
        dateLabel: formatPatientDate(record.consultationDate),
        weight: data.weightKg,
        height: data.heightCm,
        bmi: data.bmi,
        ageMonths: data.ageMonths,
      };
    })
    .filter((point) => point.weight !== null);
}

function ChartPanel({
  title,
  data,
  lines,
}: {
  title: string;
  data: Record<string, string | number | null>[];
  lines: { key: string; name: string; color: string }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 text-center text-sm text-muted-foreground">
        Sem dados suficientes para {title.toLowerCase()}.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-background p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function NutritionEvolutionCharts({ records }: NutritionEvolutionChartsProps) {
  const adultPoints = buildAdultPoints(records);
  const childPoints = buildChildPoints(records);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartPanel
        title="Evolução de peso e IMC (adultos)"
        data={adultPoints}
        lines={[
          { key: "weight", name: "Peso (kg)", color: "var(--chart-1)" },
          { key: "bmi", name: "IMC", color: "var(--chart-2)" },
        ]}
      />
      <ChartPanel
        title="Composição corporal (adultos)"
        data={adultPoints}
        lines={[
          { key: "fatPercent", name: "% gordura", color: "var(--chart-3)" },
          { key: "waist", name: "Cintura (cm)", color: "var(--chart-4)" },
        ]}
      />
      <ChartPanel
        title="Curvas pediátricas — peso e altura"
        data={childPoints}
        lines={[
          { key: "weight", name: "Peso (kg)", color: "var(--chart-1)" },
          { key: "height", name: "Altura (cm)", color: "var(--chart-2)" },
        ]}
      />
      <ChartPanel
        title="Curvas pediátricas — IMC por idade"
        data={childPoints}
        lines={[{ key: "bmi", name: "IMC", color: "var(--chart-5)" }]}
      />
    </div>
  );
}
