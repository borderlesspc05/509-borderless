"use client";

import { useMemo } from "react";

import {
  DEMUCA_DOMAINS,
  type DemucaEvaluationHistoryItem,
  type DemucaScoreResult,
} from "@/lib/demuca";

type DemucaScoreChartsProps = {
  scores: DemucaScoreResult;
  history: DemucaEvaluationHistoryItem[];
};

type HistoryChartRow = {
  evaluation: string;
  date: string;
  values: Record<string, number>;
};

const DOMAIN_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#d97706",
] as const;

const CHART_WIDTH = 640;
const CHART_HEIGHT = 300;
const PLOT_LEFT = 48;
const PLOT_TOP = 14;
const PLOT_WIDTH = 578;
const PLOT_HEIGHT = 220;
const GRID_VALUES = [0, 25, 50, 75, 100] as const;

function toPercent(value: number) {
  return Math.round(value * 100);
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

function yForPercent(value: number) {
  return PLOT_TOP + PLOT_HEIGHT - (value / 100) * PLOT_HEIGHT;
}

function AxisGrid() {
  return (
    <g aria-hidden="true">
      {GRID_VALUES.map((value) => {
        const y = yForPercent(value);

        return (
          <g key={value}>
            <line
              x1={PLOT_LEFT}
              x2={PLOT_LEFT + PLOT_WIDTH}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray={value === 0 ? undefined : "4 5"}
            />
            <text
              x={PLOT_LEFT - 9}
              y={y + 4}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              {value}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

function splitCategoryLabel(label: string) {
  const parts = label.split(" ");
  const midpoint = Math.ceil(parts.length / 2);
  return [parts.slice(0, midpoint).join(" "), parts.slice(midpoint).join(" ")];
}

export function DemucaScoreCharts({
  scores,
  history,
}: DemucaScoreChartsProps) {
  const historyData = useMemo(() => {
    const visibleHistory = history.slice(-7);
    const firstVisibleIndex = history.length - visibleHistory.length;
    const savedEvaluations: HistoryChartRow[] = visibleHistory.map(
      (evaluation, index) => ({
        evaluation: `${firstVisibleIndex + index + 1}ª avaliação`,
        date: formatDateLabel(evaluation.evaluationDate),
        values: Object.fromEntries(
          evaluation.domains.map((domain) => [
            domain.domainId,
            toPercent(domain.finalScore),
          ])
        ),
      })
    );

    return [
      ...savedEvaluations,
      {
        evaluation: `${history.length + 1}ª avaliação`,
        date: "Atual",
        values: Object.fromEntries(
          scores.domains.map((domain) => [
            domain.domainId,
            toPercent(domain.finalScore),
          ])
        ),
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

  const groupWidth = PLOT_WIDTH / historyData.length;
  const groupedBarGap = Math.min(2, groupWidth * 0.025);
  const groupedBarWidth = Math.max(
    2,
    Math.min(18, (groupWidth * 0.82) / DEMUCA_DOMAINS.length - groupedBarGap)
  );
  const groupedBarsWidth =
    DEMUCA_DOMAINS.length * groupedBarWidth +
    (DEMUCA_DOMAINS.length - 1) * groupedBarGap;
  const currentSlotWidth = PLOT_WIDTH / currentData.length;
  const currentBarWidth = Math.min(56, currentSlotWidth * 0.58);

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

        <svg
          className="block h-auto w-full"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="Gráfico comparativo das categorias DEMUCA por avaliação"
        >
          <AxisGrid />
          {historyData.map((evaluation, evaluationIndex) => {
            const groupStart =
              PLOT_LEFT +
              evaluationIndex * groupWidth +
              (groupWidth - groupedBarsWidth) / 2;

            return (
              <g key={`${evaluation.evaluation}-${evaluation.date}`}>
                {DEMUCA_DOMAINS.map((domain, domainIndex) => {
                  const value = evaluation.values[domain.id] ?? 0;
                  const barHeight = (value / 100) * PLOT_HEIGHT;

                  return (
                    <rect
                      key={domain.id}
                      x={
                        groupStart +
                        domainIndex * (groupedBarWidth + groupedBarGap)
                      }
                      y={PLOT_TOP + PLOT_HEIGHT - barHeight}
                      width={groupedBarWidth}
                      height={barHeight}
                      rx="2"
                      fill={DOMAIN_COLORS[domainIndex]}
                    >
                      <title>{`${evaluation.evaluation}, ${domain.shortLabel}: ${value}%`}</title>
                    </rect>
                  );
                })}
                <text
                  x={PLOT_LEFT + evaluationIndex * groupWidth + groupWidth / 2}
                  y={PLOT_TOP + PLOT_HEIGHT + 19}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize="10"
                  fontWeight="600"
                >
                  {evaluation.evaluation.replace(" avaliação", "")}
                </text>
                <text
                  x={PLOT_LEFT + evaluationIndex * groupWidth + groupWidth / 2}
                  y={PLOT_TOP + PLOT_HEIGHT + 35}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="9"
                >
                  {evaluation.date}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {DEMUCA_DOMAINS.map((domain, index) => (
            <div
              key={domain.id}
              className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground"
            >
              <span
                className="size-2.5 rounded-[0.18rem]"
                style={{ backgroundColor: DOMAIN_COLORS[index] }}
                aria-hidden="true"
              />
              {domain.shortLabel}
            </div>
          ))}
        </div>
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

        <svg
          className="block h-auto w-full"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="Gráfico do resultado atual por categoria DEMUCA"
        >
          <AxisGrid />
          {currentData.map((category, index) => {
            const centerX = PLOT_LEFT + index * currentSlotWidth + currentSlotWidth / 2;
            const barHeight = (category.score / 100) * PLOT_HEIGHT;
            const [firstLine, secondLine] = splitCategoryLabel(category.category);

            return (
              <g key={category.category}>
                <rect
                  x={centerX - currentBarWidth / 2}
                  y={PLOT_TOP + PLOT_HEIGHT - barHeight}
                  width={currentBarWidth}
                  height={barHeight}
                  rx="6"
                  fill="var(--chart-1)"
                >
                  <title>{`${category.category}: ${category.score}%`}</title>
                </rect>
                <text
                  x={centerX}
                  y={Math.max(PLOT_TOP + 11, yForPercent(category.score) - 7)}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize="11"
                  fontWeight="700"
                >
                  {category.score}%
                </text>
                <text
                  x={centerX}
                  y={PLOT_TOP + PLOT_HEIGHT + 19}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="9"
                >
                  <tspan x={centerX}>{firstLine}</tspan>
                  {secondLine ? (
                    <tspan x={centerX} dy="12">
                      {secondLine}
                    </tspan>
                  ) : null}
                </text>
              </g>
            );
          })}
        </svg>
      </section>
    </div>
  );
}
