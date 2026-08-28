"use client";

import { Clock } from "lucide-react";

import { NutritionMealPlanFoodEditor } from "@/components/nutrition/nutrition-meal-plan-food-editor";
import { NutritionMacroSummary } from "@/components/nutrition/nutrition-ui";
import type { NutritionMealPlanRecord } from "@/lib/nutrition/types";

type NutritionMealPlanReadOnlyProps = {
  plan: NutritionMealPlanRecord;
};

export function NutritionMealPlanReadOnly({ plan }: NutritionMealPlanReadOnlyProps) {
  return (
    <div className="space-y-4 border-t border-border/60 pt-4">
      {plan.notes ? (
        <p className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {plan.notes}
        </p>
      ) : null}

      <NutritionMacroSummary
        caloriesKcal={plan.macros.caloriesKcal}
        carbsG={plan.macros.carbsG}
        proteinG={plan.macros.proteinG}
        fatG={plan.macros.fatG}
      />

      <div className="space-y-4">
        {plan.meals.map((meal) => (
          <article
            key={meal.id}
            className="overflow-hidden rounded-xl border border-border/70 bg-background"
          >
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-4 py-2.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {meal.time} — {meal.name}
              </p>
            </div>

            {meal.foods.length > 0 ? (
              <ul className="space-y-2 p-4">
                {meal.foods.map((food, index) => (
                  <NutritionMealPlanFoodEditor
                    key={`${food.foodId}-${index}`}
                    food={food}
                    foodCatalog={[]}
                    readOnly
                    onChange={() => undefined}
                    onRemove={() => undefined}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Nenhum alimento nesta refeição.
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
