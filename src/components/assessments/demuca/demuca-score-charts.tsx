"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  DEMUCA_DOMAINS,
  type DemucaEvaluationHistoryItem,
  type DemucaScoreResult,
} from "@/lib/demuca";

type DemucaScoreChartsProps = {
  scores: DemucaScoreResult;
  history: DemucaEvaluationHistoryItem[];
};

const DOMAIN_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#d97706",
] as const;

function toPercent(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 1) * 100);
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  if (!year || !month || !day) {
    return dateKey;
  }
  return `${day}/${month}/${year}`;
}

export function DemucaScoreCharts({
  scores,
  history,
}: DemucaScoreChartsProps) {
  const historyData = useMemo(() => {
    const visibleHistory = history.slice(-7);
    const firstVisibleIndex = Math.max(0, history.length - visibleHistory.length);

    const rows = visibleHistory.map((evaluation, index) => {
      const values = Object.fromEntries(
        DEMUCA_DOMAINS.map((domain) => {
          const found = evaluation.domains.find(
            (item) => item.domainId === domain.id
          );
          return [domain.id, found ? toPercent(found.finalScore) : 0];
        })
      );

      return {
        label: `${firstVisibleIndex + index + 1}ª`,
        date: formatDateLabel(evaluation.evaluationDate),
        ...values,
      };
    });

    const currentValues = Object.fromEntries(
      DEMUCA_DOMAINS.map((domain) => {
        const found = scores.domains.find((item) => item.domainId === domain.id);
        return [domain.id, found ? toPercent(found.finalScore) : 0];
      })
    );

    return [
      ...rows,
      {
        label: "Atual",
        date: "agora",
        ...currentValues,
      },
    ];
  }, [history, scores.domains]);

  const currentData = useMemo(
    () =>
      DEMUCA_DOMAINS.map((definition) => {
        const domain = scores.domains.find(
          (item) => item.domainId === definition.id
        );
        return {
          category: definition.shortLabel,
          score: domain ? toPercent(domain.finalScore) : 0,
        };
      }),
    [scores.domains]
  );

  const hasHistoryValues = historyData.some((row) =>
    DEMUCA_DOMAINS.some((domain) => {
      const value = (row as Record<string, string | number>)[domain.id];
      return Number(value ?? 0) > 0;
    })
  );
  const hasCurrentValues = currentData.some((item) => item.score > 0);

  return (
    <div className="grid gap-4 border-t border-border/60 p-4 lg:grid-cols-2 lg:p-5">
      <section className="rounded-xl border border-border/60 bg-background p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Categorias por avaliação
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Comparação da avaliação atual com os resultados finalizados.
          </p>
        </div>

        {hasHistoryValues || hasCurrentValues ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  labelFormatter={(label, payload) => {
                    const date = payload?.[0]?.payload?.date;
                    return date ? `${label} · ${date}` : String(label);
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {DEMUCA_DOMAINS.map((domain, index) => (
                  <Bar
                    key={domain.id}
                    dataKey={domain.id}
                    name={domain.shortLabel}
                    fill={DOMAIN_COLORS[index]}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={18}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Preencha os itens da escala para gerar o gráfico comparativo.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border/60 bg-background p-3 sm:p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Resultado atual por categoria
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Percentual alcançado em cada um dos seis domínios da escala.
          </p>
        </div>

        {hasCurrentValues ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  width={42}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Escore"]} />
                <Bar
                  dataKey="score"
                  name="Escore"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  label={{
                    position: "top",
                    formatter: (value) => `${value}%`,
                    fontSize: 11,
                    fill: "var(--foreground)",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            Responda os itens (ou habilite avaliação parcial) para exibir o
            gráfico por categoria.
          </p>
        )}
      </section>
    </div>
  );
}
