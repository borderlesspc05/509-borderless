"use client";

import { Label } from "@/components/ui/label";
import {
  careModalityItems,
  toggleCareModality,
  type CareModality,
} from "@/lib/care-modality";
import { cn } from "@/lib/utils";

type CareModalityFieldProps = {
  idPrefix: string;
  values: CareModality[];
  onChange: (values: CareModality[]) => void;
  className?: string;
};

export function CareModalityField({
  idPrefix,
  values,
  onChange,
  className,
}: CareModalityFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Label className="text-sm font-medium text-muted-foreground">
        Modalidade de atendimento
      </Label>
      <p className="text-xs text-muted-foreground">
        Selecione uma ou ambas as opções, conforme o atendimento do paciente ou
        profissional.
      </p>
      <div className="flex flex-wrap gap-4">
        {careModalityItems.map((item) => {
          const checkboxId = `${idPrefix}-${item.value}`;

          return (
            <label
              key={item.value}
              htmlFor={checkboxId}
              className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={values.includes(item.value)}
                onChange={() => onChange(toggleCareModality(values, item.value))}
                className="size-4 accent-primary"
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
