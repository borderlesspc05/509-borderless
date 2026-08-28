# Parecer da Nutricionista — Módulo de Nutrição

**Data do feedback:** 28/08/2026  
**Origem:** Teste e observação da nutricionista no aplicativo Borderless 509  
**Destinatário:** Equipe de desenvolvimento (módulo Nutrição)  
**Status:** Implementado (28/08/2026)

---

## Resumo executivo

A nutricionista validou o módulo de Nutrição e identificou **dois blocos principais de melhoria**:

1. **Antropometria** — evolução incompleta dos dados e campos faltantes (coxa D/E)
2. **Planejamento alimentar** — porções fixas em 100g, ausência de medidas caseiras e de substituições por alimento

O módulo já possui base funcional (formulários, banco de dados, gráficos parciais e plano alimentar). As melhorias solicitadas são **evoluções de UX e completude clínica**, não recriação do módulo.

---

## 1. Antropometria (Adultos/Idosos)

### 1.1 Comparação de todos os dados ao longo das consultas

**Feedback da nutricionista:**
> Não consegui localizar a comparação entre todos os dados antropométricos obtidos ao longo das consultas. Observei a disponibilidade dos gráficos de comparação apenas entre peso/IMC e percentual de gordura/circunferência de cintura. Gostaria que fosse disponibilizado, mesmo que em formato de tabela ou outro, a comparação entre todos os dados antropométricos coletados na consulta, mantendo essas informações salvas para comparar nas próximas consultas a evolução do paciente.

**Estado atual no sistema:**

| Recurso | Situação |
|---------|----------|
| Coleta de dados (adulto) | ✅ Peso, altura, IMC, bioimpedância (gordura, músculo, água, osso, visceral, idade metabólica), circunferências (tórax, abdômen, cintura, quadril, braços) |
| Persistência entre consultas | ✅ `patient_nutrition_anthropometry` (JSONB `form_data`) |
| Gráficos de evolução | ⚠️ Apenas **Peso + IMC** e **% gordura + cintura** |
| Tabela comparativa entre consultas | ❌ Não existe |
| Demais métricas em gráfico | ❌ Tórax, abdômen, quadril, braços, demais bioimpedância |

**Arquivos relacionados:**
- `src/components/nutrition/nutrition-anthropometry-section.tsx`
- `src/components/nutrition/nutrition-evolution-charts.tsx`
- `src/lib/nutrition/types.ts` (`AdultAnthropometryData`)
- `src/app/actions/nutrition-actions.ts`

**O que implementar:**

- [ ] Tabela de evolução antropométrica (linhas = métricas, colunas = datas de consulta)
- [ ] Incluir **todas** as medidas coletadas no formulário adulto
- [ ] Manter gráficos atuais e complementar com a tabela (não substituir)
- [ ] (Opcional) Gráficos adicionais para métricas mais usadas (quadril, braços, massa magra)

**Critério de aceite:**
- Nutricionista consegue ver, em uma única tela, a evolução de **todos** os campos salvos entre consultas do mesmo paciente.

---

### 1.2 Circunferência da coxa direita e esquerda

**Feedback da nutricionista:**
> Senti falta nas circunferências do campo de "circunferência da coxa direita" e "circunferência da coxa esquerda".

**Estado atual:**

| Item | Situação |
|------|----------|
| `leftThighCm` / `rightThighCm` em tipos | ❌ Ausente |
| Campos no formulário | ❌ Ausente |
| Salvamento no banco | ❌ Ausente |
| Exibição em gráficos/tabela | ❌ Ausente |

**O que implementar:**

- [ ] Adicionar `leftThighCm` e `rightThighCm` em `AdultAnthropometryData.measurements`
- [ ] Incluir campos no formulário de antropometria (adulto/idoso)
- [ ] Incluir na tabela de evolução e, se aplicável, em gráficos
- [ ] Garantir retrocompatibilidade (registros antigos sem coxa = valor vazio/—)

**Critério de aceite:**
- Nutricionista registra coxa D e E na consulta e visualiza evolução nas consultas seguintes.

---

## 2. Planejamento alimentar

### 2.1 Quantidades editáveis (não apenas 100g)

**Feedback da nutricionista:**
> Senti dificuldade para inserir as quantidades adequadas de cada alimento no plano alimentar, pois atualmente as opções aparecem apenas na quantidade de 100g. Seria importante que as quantidades dos alimentos pudessem ser editáveis, permitindo ajuste da porção de acordo com as necessidades e objetivos de cada paciente.

**Estado atual:**

| Item | Situação |
|------|----------|
| Modelo `MealPlanFoodItem.quantityG` | ✅ Suporta qualquer grama |
| Função `scaleFoodNutrients()` | ✅ Escala macros por porção |
| UI ao adicionar alimento | ❌ Sempre fixa em **100g** |
| UI para editar porção no plano | ❌ Não existe |
| Cadastro de alimento customizado | ⚠️ Apenas "valores por 100g" |

**Arquivos relacionados:**
- `src/components/nutrition/nutrition-meal-plan-section.tsx`
- `src/lib/nutrition/calculations.ts`
- `src/lib/nutrition/types.ts` (`MealPlanFoodItem`)

**O que implementar:**

- [ ] Campo de quantidade (gramas) ao adicionar alimento à refeição
- [ ] Edição inline da quantidade em alimentos já adicionados
- [ ] Recalcular macros automaticamente ao alterar gramas
- [ ] (Opcional) Permitir `servingSizeG` customizado no cadastro de alimento

**Critério de aceite:**
- Nutricionista adiciona "Pão integral" com 50g (não 100g) e os macros refletem 50g.
- Alterar 50g → 75g recalcula kcal, carboidratos, proteínas e gorduras na hora.

---

### 2.2 Medidas caseiras editáveis e recalculadas

**Feedback da nutricionista:**
> Além da quantidade em gramas, seria importante disponibilizar medidas caseiras (colher de sopa, colher de sobremesa, concha, fatia, copo americano, xícara, unidade) facilitando a compreensão e aplicação do plano pelo paciente. Todas essas medidas precisam ser editáveis e calculadas de acordo com cada mudança feita.

**Estado atual:** ❌ Funcionalidade inexistente (apenas gramas, fixas em 100g).

**Medidas solicitadas:**
- Colher de sopa
- Colher de sobremesa
- Concha
- Fatia
- Copo americano
- Xícara
- Unidade

**O que implementar:**

- [ ] Modelo de dados: medida caseira + equivalência em gramas por alimento (ou tabela de conversão)
- [ ] UI: seletor de tipo de medida + quantidade (ex.: "2 Fatia(s) média(s) (50g)")
- [ ] Sincronização bidirecional: alterar gramas → atualiza medida; alterar medida → atualiza gramas
- [ ] Exibição no plano para o paciente no formato da referência (ver seção 2.3)

**Critério de aceite:**
- Nutricionista define "1,5 colher(es) de sopa (15g)" e o sistema mantém gramas e medida consistentes.
- Alterar gramas recalcula a medida caseira proporcionalmente (quando houver fator de conversão).

---

### 2.3 Lista de substituições por alimento

**Feedback da nutricionista:**
> Senti falta de incluir uma lista de substituições vinculada a cada alimento do plano alimentar. Seria interessante uma opção para adicionar alimentos substitutos, permitindo alternativas equivalentes para variar a alimentação sem modificar todo o plano.

**Referência visual (exemplo fornecido):**

```
07:30 - Café-da-manhã
┌─────────────────────────┬──────────────────────┐
│ Pão de forma integral   │ 2 Fatia(s) (50g)     │
│ Ovo de galinha mexido   │ 2 Unidade(s) (100g)  │
│ Mamão                   │ 1 Fatia(s) (170g)    │
└─────────────────────────┴──────────────────────┘

Opções de substituição para Pão de forma integral:
Batata doce cozida (140g) - ou - Pão de forma (50g) - ou - Goma de tapioca (45g) ...

Opções de substituição para Ovo de galinha mexido:
Geleia 100% da fruta (39g) - ou - Frango desfiado (50g) - ou - ...
```

**Estado atual:**

| Item | Situação |
|------|----------|
| Substituições estruturadas | ❌ Não existe |
| Campo `notes` no plano | ⚠️ Apenas texto livre (workaround manual) |
| Modelo `MealPlanFoodItem` | ❌ Sem array de substitutos |

**O que implementar:**

- [ ] Estender `MealPlanFoodItem` com `substitutions: MealPlanSubstitution[]`
- [ ] UI para adicionar/remover substitutos por alimento (busca no banco de alimentos)
- [ ] Cada substituto: nome, medida caseira, gramas, macros equivalentes
- [ ] Exibição no plano salvo e (futuro) exportação PDF
- [ ] Persistência no JSONB `meals` de `patient_nutrition_meal_plans`

**Tipo sugerido:**

```typescript
type MealPlanSubstitution = {
  foodId: string;
  foodName: string;
  quantityG: number;
  householdMeasure?: {
    type: HouseholdMeasureType;
    amount: number;
    label: string; // ex.: "Fatia(s) média(s)"
  };
  caloriesKcal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

type MealPlanFoodItem = {
  // ...campos atuais
  householdMeasure?: { ... };
  substitutions?: MealPlanSubstitution[];
};
```

**Critério de aceite:**
- Para cada alimento da refeição, nutricionista adiciona N substitutos com porção equivalente.
- Substituições aparecem agrupadas abaixo do alimento principal, no formato "Opções de substituição para [alimento]:".

---

## 3. Priorização sugerida

| Prioridade | Item | Esforço estimado | Impacto clínico |
|------------|------|------------------|-----------------|
| P1 | Porções editáveis (gramas) | Baixo | Alto |
| P1 | Coxa D/E na antropometria | Baixo | Médio |
| P2 | Tabela de evolução antropométrica completa | Médio | Alto |
| P2 | Medidas caseiras editáveis | Alto | Alto |
| P3 | Substituições por alimento | Alto | Alto |
| P3 | Gráficos adicionais (opcional) | Médio | Médio |

---

## 4. Mapa técnico rápido

```
Módulo Nutrição
├── Antropometria
│   ├── nutrition-anthropometry-section.tsx   ← formulário + histórico
│   ├── nutrition-evolution-charts.tsx        ← gráficos (expandir)
│   └── types.ts → AdultAnthropometryData     ← + coxa D/E
│
├── Planejamento alimentar
│   ├── nutrition-meal-plan-section.tsx       ← porções, medidas, substituições
│   ├── calculations.ts                       ← scaleFoodNutrients (já pronto)
│   └── types.ts → MealPlanFoodItem           ← + householdMeasure, substitutions
│
└── Banco
    └── supabase/migrations/20260824140000_nutricao_schema.sql
        └── meals JSONB (sem migration obrigatória se só JSONB evoluir)
```

---

## 5. Itens adicionais identificados na análise técnica (não no parecer, mas relevantes)

- Edição de registro antropométrico no histórico (backend suporta; UI não expõe "Editar")
- Classificação de gordura corporal usa sempre limiares femininos (ignora sexo do paciente)
- Adulto/idoso compartilham o mesmo tipo `adult` sem campos geriátricos específicos
- Banco de alimentos: 15 itens TBCA seed; não é integração completa TBCA
- Sem exportação PDF do plano alimentar (apenas orientações/prescrições)

---

## 6. Checklist de validação com a nutricionista (pós-implementação)

### Antropometria
- [ ] Registrar consulta com todas as medidas incluindo coxa D/E
- [ ] Na segunda consulta, visualizar tabela com evolução de **todos** os campos
- [ ] Confirmar que dados antigos continuam visíveis

### Planejamento alimentar
- [ ] Adicionar alimento com porção diferente de 100g (ex.: 50g, 37,5g)
- [ ] Editar porção após adicionado e ver macros recalculados
- [ ] Usar medida caseira (ex.: 2 fatias = 50g) com sincronização
- [ ] Adicionar 3+ substitutos para um alimento e visualizar lista formatada
- [ ] Salvar plano, recarregar página e confirmar persistência

---

## 7. Contato e próximos passos

1. Equipe de desenvolvimento revisa este documento e estima sprint
2. Validar com nutricionista o layout da tabela de evolução e das substituições (mock/wireframe)
3. Implementar em fases (P1 → P2 → P3)
4. Agendar reteste com a nutricionista após P1 + P2

---

*Documento gerado a partir do parecer clínico e análise do código-fonte do repositório 509-borderless.*
