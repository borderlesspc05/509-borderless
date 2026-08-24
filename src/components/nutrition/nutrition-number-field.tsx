"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { nutritionInputClassName } from "@/components/nutrition/nutrition-ui";

type NutritionNumberFieldProps = {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  step?: string;
  readOnly?: boolean;
  hint?: string;
};

export function NutritionNumberField({
  id,
  label,
  value,
  onChange,
  unit,
  step = "0.1",
  readOnly = false,
  hint,
}: NutritionNumberFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step={step}
          readOnly={readOnly}
          value={value ?? ""}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
          className={cn(nutritionInputClassName, unit && "pr-14")}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center rounded-md bg-muted/60 px-1.5 text-[0.7rem] font-medium text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
