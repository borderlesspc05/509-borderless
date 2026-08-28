"use client";

import { Plus, Trash2 } from "lucide-react";

import { NutritionNumberField } from "@/components/nutrition/nutrition-number-field";
import { nutritionInputClassName } from "@/components/nutrition/nutrition-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scaleFoodNutrients } from "@/lib/nutrition/calculations";
import {
  createDefaultHouseholdMeasure,
  formatHouseholdMeasure,
  HOUSEHOLD_MEASURE_LABELS,
  HOUSEHOLD_MEASURE_TYPES,
  quantityFromHouseholdMeasure,
  syncHouseholdMeasureFromGrams,
  type HouseholdMeasureType,
} from "@/lib/nutrition/household-measures";
import type {
  MealPlanFoodItem,
  MealPlanSubstitution,
  NutritionFood,
} from "@/lib/nutrition/types";

type NutritionMealPlanFoodEditorProps = {
  food: MealPlanFoodItem;
  foodCatalog: NutritionFood[];
  readOnly?: boolean;
  onChange: (food: MealPlanFoodItem) => void;
  onRemove: () => void;
};

function findFoodCatalogItem(
  foodCatalog: NutritionFood[],
  foodId: string,
  foodName: string
): NutritionFood {
  return (
    foodCatalog.find((item) => item.id === foodId) ?? {
      id: foodId,
      name: foodName,
      source: "custom",
      servingSizeG: 100,
      caloriesKcal: 0,
      carbsG: 0,
      proteinG: 0,
      fatG: 0,
      isCustom: true,
    }
  );
}

function applyQuantity(
  food: MealPlanFoodItem,
  catalogItem: NutritionFood,
  quantityG: number,
  householdMeasure = food.householdMeasure
): MealPlanFoodItem {
  const nutrients = scaleFoodNutrients(catalogItem, quantityG);

  return {
    ...food,
    quantityG,
    ...nutrients,
    householdMeasure: householdMeasure
      ? syncHouseholdMeasureFromGrams(householdMeasure, quantityG)
      : undefined,
  };
}

function SubstitutionEditor({
  substitution,
  foodCatalog,
  onChange,
  onRemove,
}: {
  substitution: MealPlanSubstitution;
  foodCatalog: NutritionFood[];
  onChange: (substitution: MealPlanSubstitution) => void;
  onRemove: () => void;
}) {
  const catalogItem = findFoodCatalogItem(
    foodCatalog,
    substitution.foodId,
    substitution.foodName
  );

  function updateQuantityG(quantityG: number | null) {
    if (!quantityG || quantityG <= 0) return;

    const nutrients = scaleFoodNutrients(catalogItem, quantityG);

    onChange({
      ...substitution,
      quantityG,
      ...nutrients,
      householdMeasure: substitution.householdMeasure
        ? syncHouseholdMeasureFromGrams(substitution.householdMeasure, quantityG)
        : undefined,
    });
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{substitution.foodName}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <NutritionNumberField
          id={`sub-qty-${substitution.foodId}`}
          label="Quantidade"
          unit="g"
          value={substitution.quantityG}
          onChange={updateQuantityG}
        />
        {substitution.householdMeasure ? (
          <p className="self-end text-xs text-muted-foreground">
            {formatHouseholdMeasure(substitution.householdMeasure)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function NutritionMealPlanFoodEditor({
  food,
  foodCatalog,
  readOnly = false,
  onChange,
  onRemove,
}: NutritionMealPlanFoodEditorProps) {
  const catalogItem = findFoodCatalogItem(foodCatalog, food.foodId, food.foodName);
  const householdMeasure =
    food.householdMeasure ??
    createDefaultHouseholdMeasure("unit", catalogItem.servingSizeG);

  function updateQuantityG(quantityG: number | null) {
    if (!quantityG || quantityG <= 0) return;
    onChange(applyQuantity(food, catalogItem, quantityG, householdMeasure));
  }

  function updateHouseholdMeasure(partial: Partial<typeof householdMeasure>) {
    const nextMeasure = { ...householdMeasure, ...partial };
    const quantityG = quantityFromHouseholdMeasure(nextMeasure);
    onChange(applyQuantity(food, catalogItem, quantityG, nextMeasure));
  }

  function addSubstitution(candidate: NutritionFood) {
    const nutrients = scaleFoodNutrients(candidate, candidate.servingSizeG);
    const substitution: MealPlanSubstitution = {
      foodId: candidate.id,
      foodName: candidate.name,
      quantityG: candidate.servingSizeG,
      ...nutrients,
      householdMeasure: createDefaultHouseholdMeasure("unit", candidate.servingSizeG),
    };

    onChange({
      ...food,
      substitutions: [...(food.substitutions ?? []), substitution],
    });
  }

  function updateSubstitution(index: number, substitution: MealPlanSubstitution) {
    const substitutions = [...(food.substitutions ?? [])];
    substitutions[index] = substitution;
    onChange({ ...food, substitutions });
  }

  function removeSubstitution(index: number) {
    onChange({
      ...food,
      substitutions: (food.substitutions ?? []).filter((_, i) => i !== index),
    });
  }

  if (readOnly) {
    return (
      <li className="space-y-2 rounded-lg border border-border/60 px-3 py-3 text-sm">
        <div>
          <p className="font-medium text-foreground">{food.foodName}</p>
          <p className="text-xs text-muted-foreground">
            {food.householdMeasure
              ? formatHouseholdMeasure(food.householdMeasure)
              : `${food.quantityG}g`}
            {" · "}
            {food.caloriesKcal.toFixed(0)} kcal
          </p>
        </div>
        {(food.substitutions ?? []).length > 0 ? (
          <div className="space-y-1 border-t border-border/50 pt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Opções de substituição para {food.foodName}:
            </p>
            <p className="text-xs leading-relaxed text-foreground">
              {(food.substitutions ?? [])
                .map((substitution) => {
                  const measure = substitution.householdMeasure
                    ? formatHouseholdMeasure(substitution.householdMeasure)
                    : `${substitution.quantityG}g`;
                  return `${substitution.foodName} (${measure})`;
                })
                .join(" - ou - ")}
            </p>
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-lg border border-border/60 bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm font-semibold text-foreground">{food.foodName}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <NutritionNumberField
              id={`food-qty-${food.foodId}`}
              label="Quantidade"
              unit="g"
              value={food.quantityG}
              onChange={updateQuantityG}
            />

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Medida caseira
              </Label>
              <Select
                value={householdMeasure.type}
                onValueChange={(value) =>
                  updateHouseholdMeasure({ type: value as HouseholdMeasureType })
                }
              >
                <SelectTrigger className={nutritionInputClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUSEHOLD_MEASURE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {HOUSEHOLD_MEASURE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <NutritionNumberField
              id={`food-measure-amount-${food.foodId}`}
              label="Qtd. da medida"
              value={householdMeasure.amount}
              onChange={(value) => {
                if (!value || value <= 0) return;
                updateHouseholdMeasure({ amount: value });
              }}
            />

            <NutritionNumberField
              id={`food-grams-per-unit-${food.foodId}`}
              label="Gramas por medida"
              unit="g"
              value={householdMeasure.gramsPerUnit}
              onChange={(value) => {
                if (!value || value <= 0) return;
                updateHouseholdMeasure({ gramsPerUnit: value });
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {formatHouseholdMeasure(householdMeasure)} · {food.caloriesKcal.toFixed(0)}{" "}
            kcal · C {food.carbsG.toFixed(1)}g · P {food.proteinG.toFixed(1)}g · G{" "}
            {food.fatG.toFixed(1)}g
          </p>
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Substituições para {food.foodName}
          </p>
          <div className="flex flex-wrap gap-1">
            {foodCatalog.slice(0, 6).map((candidate) => (
              <Button
                key={`${food.foodId}-sub-${candidate.id}`}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[0.65rem]"
                onClick={() => addSubstitution(candidate)}
              >
                <Plus className="size-3" />
                {candidate.name}
              </Button>
            ))}
          </div>
        </div>

        {(food.substitutions ?? []).length > 0 ? (
          <div className="space-y-2">
            {(food.substitutions ?? []).map((substitution, index) => (
              <SubstitutionEditor
                key={`${substitution.foodId}-${index}`}
                substitution={substitution}
                foodCatalog={foodCatalog}
                onChange={(next) => updateSubstitution(index, next)}
                onRemove={() => removeSubstitution(index)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Adicione alternativas equivalentes para o paciente variar a alimentação.
          </p>
        )}
      </div>
    </li>
  );
}

export function normalizeMealPlanFoodItem(food: MealPlanFoodItem): MealPlanFoodItem {
  return {
    ...food,
    substitutions: food.substitutions ?? [],
  };
}
