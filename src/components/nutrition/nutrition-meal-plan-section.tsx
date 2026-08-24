"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Clock, Plus, Save, Search, Trash2, UtensilsCrossed } from "lucide-react";

import {
  deleteNutritionMealPlanAction,
  listNutritionMealPlansAction,
  saveNutritionFoodAction,
  saveNutritionMealPlanAction,
  searchNutritionFoodsAction,
} from "@/app/actions/nutrition-actions";
import { NutritionNumberField } from "@/components/nutrition/nutrition-number-field";
import {
  NutritionFieldGroup,
  NutritionFormFooter,
  NutritionHistoryItem,
  NutritionMacroSummary,
  NutritionSectionCard,
  nutritionInputClassName,
  nutritionTextareaClassName,
} from "@/components/nutrition/nutrition-ui";
import { useAppToast } from "@/hooks/use-app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  scaleFoodNutrients,
  summarizeMealPlanMacros,
} from "@/lib/nutrition/calculations";
import type {
  MealPlanMeal,
  NutritionFood,
  NutritionMealPlanRecord,
} from "@/lib/nutrition/types";

type NutritionMealPlanSectionProps = {
  patientId: string;
  readOnly?: boolean;
};

function createMeal(name: string, time: string): MealPlanMeal {
  return {
    id: crypto.randomUUID(),
    name,
    time,
    foods: [],
  };
}

export function NutritionMealPlanSection({
  patientId,
  readOnly = false,
}: NutritionMealPlanSectionProps) {
  const toast = useAppToast();
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<NutritionMealPlanRecord[]>([]);
  const [templates, setTemplates] = useState<NutritionMealPlanRecord[]>([]);
  const [foods, setFoods] = useState<NutritionFood[]>([]);
  const [foodQuery, setFoodQuery] = useState("");
  const [title, setTitle] = useState("Plano alimentar");
  const [notes, setNotes] = useState("");
  const [meals, setMeals] = useState<MealPlanMeal[]>([
    createMeal("Café da manhã", "07:00"),
    createMeal("Almoço", "12:00"),
    createMeal("Jantar", "19:00"),
  ]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newFood, setNewFood] = useState({
    name: "",
    caloriesKcal: 0,
    carbsG: 0,
    proteinG: 0,
    fatG: 0,
  });

  const loadData = useCallback(async () => {
    const [plansResult, templatesResult, foodsResult] = await Promise.all([
      listNutritionMealPlansAction({ patientId }),
      listNutritionMealPlansAction({ templatesOnly: true }),
      searchNutritionFoodsAction(""),
    ]);

    if (plansResult.success && plansResult.data) setPlans(plansResult.data.plans);
    if (templatesResult.success && templatesResult.data) {
      setTemplates(templatesResult.data.plans);
    }
    if (foodsResult.success && foodsResult.data) setFoods(foodsResult.data.foods);
  }, [patientId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const result = await searchNutritionFoodsAction(foodQuery);
      if (result.success && result.data) setFoods(result.data.foods);
    }, 300);
    return () => clearTimeout(timeout);
  }, [foodQuery]);

  const macros = summarizeMealPlanMacros(meals.flatMap((meal) => meal.foods));

  function addFoodToMeal(mealId: string, food: NutritionFood, quantityG: number) {
    const nutrients = scaleFoodNutrients(food, quantityG);
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? {
              ...meal,
              foods: [
                ...meal.foods,
                {
                  foodId: food.id,
                  foodName: food.name,
                  quantityG,
                  ...nutrients,
                },
              ],
            }
          : meal
      )
    );
  }

  function removeFoodFromMeal(mealId: string, index: number) {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === mealId
          ? { ...meal, foods: meal.foods.filter((_, i) => i !== index) }
          : meal
      )
    );
  }

  function handleSave(isTemplate = false) {
    startTransition(async () => {
      const result = await saveNutritionMealPlanAction({
        id: editingPlanId ?? undefined,
        patientId: isTemplate ? null : patientId,
        title,
        meals,
        macros,
        notes,
        isTemplate,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({
        title: isTemplate ? "Modelo salvo" : "Plano alimentar salvo",
      });
      setEditingPlanId(null);
      void loadData();
    });
  }

  function loadPlan(plan: NutritionMealPlanRecord) {
    setEditingPlanId(plan.id);
    setTitle(plan.title);
    setNotes(plan.notes ?? "");
    setMeals(plan.meals);
  }

  function handleDeletePlan(id: string) {
    startTransition(async () => {
      const result = await deleteNutritionMealPlanAction(id, patientId);
      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }
      toast.success({ title: "Plano removido" });
      void loadData();
    });
  }

  function handleCreateFood() {
    startTransition(async () => {
      const result = await saveNutritionFoodAction({
        name: newFood.name,
        servingSizeG: 100,
        caloriesKcal: newFood.caloriesKcal,
        carbsG: newFood.carbsG,
        proteinG: newFood.proteinG,
        fatG: newFood.fatG,
      });

      if (!result.success) {
        toast.error({ title: "Erro", description: result.error });
        return;
      }

      toast.success({ title: "Alimento cadastrado" });
      setNewFood({ name: "", caloriesKcal: 0, carbsG: 0, proteinG: 0, fatG: 0 });
      void loadData();
    });
  }

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <>
          <NutritionSectionCard
            icon={UtensilsCrossed}
            title="Planejamento alimentar"
            description={
              <>
                Refeições por horário, banco de alimentos (TBCA/customizado) e cálculo
                automático de calorias e macronutrientes. Referência:{" "}
                <a
                  href="https://www.tbca.net.br/base-dados/composicao_alimentos.php"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  TBCA
                </a>
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-title" className="text-sm font-medium text-muted-foreground">
                  Título do plano
                </Label>
                <Input
                  id="plan-title"
                  className={nutritionInputClassName}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="food-search" className="text-sm font-medium text-muted-foreground">
                  Buscar alimento
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="food-search"
                    className={`${nutritionInputClassName} pl-9`}
                    value={foodQuery}
                    onChange={(event) => setFoodQuery(event.target.value)}
                    placeholder="Digite para buscar no banco..."
                  />
                </div>
              </div>
            </div>

            <NutritionMacroSummary
              caloriesKcal={macros.caloriesKcal}
              carbsG={macros.carbsG}
              proteinG={macros.proteinG}
              fatG={macros.fatG}
            />

            <NutritionFieldGroup
              title="Cadastrar alimento personalizado"
              description="Valores por 100 g — entra no banco para uso em outros planos."
              columns={4}
            >
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                <Input
                  placeholder="Ex.: Mingau de aveia"
                  className={nutritionInputClassName}
                  value={newFood.name}
                  onChange={(event) =>
                    setNewFood((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <NutritionNumberField
                id="food-kcal"
                label="Energia"
                unit="kcal"
                value={newFood.caloriesKcal}
                onChange={(value) =>
                  setNewFood((current) => ({ ...current, caloriesKcal: value ?? 0 }))
                }
              />
              <NutritionNumberField
                id="food-carbs"
                label="Carboidratos"
                unit="g"
                value={newFood.carbsG}
                onChange={(value) =>
                  setNewFood((current) => ({ ...current, carbsG: value ?? 0 }))
                }
              />
              <NutritionNumberField
                id="food-protein"
                label="Proteínas"
                unit="g"
                value={newFood.proteinG}
                onChange={(value) =>
                  setNewFood((current) => ({ ...current, proteinG: value ?? 0 }))
                }
              />
              <NutritionNumberField
                id="food-fat"
                label="Gorduras"
                unit="g"
                value={newFood.fatG}
                onChange={(value) =>
                  setNewFood((current) => ({ ...current, fatG: value ?? 0 }))
                }
              />
            </NutritionFieldGroup>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateFood}
              disabled={!newFood.name.trim()}
            >
              Adicionar ao banco
            </Button>

            <div className="space-y-4">
              {meals.map((meal) => {
                const mealMacros = summarizeMealPlanMacros(meal.foods);
                return (
                  <article
                    key={meal.id}
                    className="overflow-hidden rounded-xl border border-border/70 bg-background"
                  >
                    <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" aria-hidden />
                        <Input
                          className="h-9 w-[88px] text-center"
                          value={meal.time}
                          onChange={(event) =>
                            setMeals((current) =>
                              current.map((item) =>
                                item.id === meal.id
                                  ? { ...item, time: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <Input
                        className="h-9 max-w-[240px] flex-1 font-medium"
                        value={meal.name}
                        onChange={(event) =>
                          setMeals((current) =>
                            current.map((item) =>
                              item.id === meal.id
                                ? { ...item, name: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <Badge variant="secondary" className="ml-auto font-normal">
                        {mealMacros.caloriesKcal.toFixed(0)} kcal
                      </Badge>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap gap-2">
                        {foods.slice(0, 10).map((food) => (
                          <Button
                            key={food.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-auto max-w-full py-1.5 text-xs"
                            onClick={() => addFoodToMeal(meal.id, food, 100)}
                          >
                            + {food.name}
                          </Button>
                        ))}
                      </div>

                      {meal.foods.length > 0 ? (
                        <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                          {meal.foods.map((food, index) => (
                            <li
                              key={`${food.foodId}-${index}`}
                              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-foreground">{food.foodName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {food.quantityG}g · {food.caloriesKcal.toFixed(0)} kcal · C{" "}
                                  {food.carbsG.toFixed(1)}g · P {food.proteinG.toFixed(1)}g · G{" "}
                                  {food.fatG.toFixed(1)}g
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFoodFromMeal(meal.id, index)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="rounded-lg border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                          Clique em um alimento acima para adicionar à refeição.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                setMeals((current) => [...current, createMeal("Nova refeição", "15:00")])
              }
            >
              <Plus className="size-4" />
              Adicionar refeição
            </Button>

            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-notes" className="text-sm font-medium text-muted-foreground">
                Observações
              </Label>
              <textarea
                id="plan-notes"
                rows={3}
                className={nutritionTextareaClassName}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Substituições, orientações de preparo, restrições..."
              />
            </div>

            <NutritionFormFooter hint="Salve como modelo para reutilizar em outros pacientes.">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleSave(true)}
              >
                Salvar como modelo
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => handleSave(false)}
                className="gap-2"
              >
                <Save className="size-4" />
                Salvar plano do paciente
              </Button>
            </NutritionFormFooter>
          </NutritionSectionCard>

          {templates.length > 0 ? (
            <NutritionSectionCard title="Modelos salvos">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => loadPlan(template)}
                    className="rounded-xl border border-border/70 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.macros.caloriesKcal.toFixed(0)} kcal · {template.meals.length}{" "}
                      refeições
                    </p>
                  </button>
                ))}
              </div>
            </NutritionSectionCard>
          ) : null}
        </>
      ) : null}

      <NutritionSectionCard title="Planos do paciente">
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum plano registrado.</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <NutritionHistoryItem
                key={plan.id}
                title={plan.title}
                subtitle={`${plan.macros.caloriesKcal.toFixed(0)} kcal · ${plan.meals.length} refeições`}
                actions={
                  !readOnly ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => loadPlan(plan)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </NutritionSectionCard>
    </div>
  );
}
