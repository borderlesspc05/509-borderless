"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getAnthropometryColumnLabel,
  getAnthropometryEvolutionRows,
  sortAnthropometryRecords,
} from "@/lib/nutrition/anthropometry-evolution";
import type {
  AnthropometryRecordType,
  NutritionAnthropometryRecord,
} from "@/lib/nutrition/types";
import { cn } from "@/lib/utils";

type NutritionEvolutionTableProps = {
  records: NutritionAnthropometryRecord[];
};

const RECORD_TYPE_OPTIONS: Array<{ value: AnthropometryRecordType; label: string }> = [
  { value: "adult", label: "Adultos/idosos" },
  { value: "child", label: "Crianças" },
];

export function NutritionEvolutionTable({ records }: NutritionEvolutionTableProps) {
  const [recordType, setRecordType] = useState<AnthropometryRecordType>("adult");

  const filteredRecords = useMemo(
    () =>
      sortAnthropometryRecords(
        records.filter((record) => record.recordType === recordType)
      ),
    [records, recordType]
  );

  const rows = getAnthropometryEvolutionRows(recordType);

  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum registro antropométrico para comparar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {RECORD_TYPE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={recordType === option.value ? "default" : "outline"}
            onClick={() => setRecordType(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhum registro do tipo selecionado para comparar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30">
                <th className="sticky left-0 z-10 min-w-[180px] bg-muted/30 px-3 py-2.5 text-left font-medium text-foreground">
                  Medida
                </th>
                {filteredRecords.map((record) => (
                  <th
                    key={record.id}
                    className="min-w-[110px] px-3 py-2.5 text-left font-medium text-muted-foreground"
                  >
                    {getAnthropometryColumnLabel(record)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium text-foreground"
                  >
                    <span>{row.label}</span>
                    {row.unit ? (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({row.unit})
                      </span>
                    ) : null}
                  </th>
                  {filteredRecords.map((record) => (
                    <td
                      key={`${record.id}-${row.id}`}
                      className={cn(
                        "px-3 py-2 text-muted-foreground",
                        row.getValue(record.formData, record.recordType) === "—" &&
                          "text-muted-foreground/60"
                      )}
                    >
                      {row.getValue(record.formData, record.recordType)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
