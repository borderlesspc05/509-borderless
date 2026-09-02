# Feedback clínico consolidado — set/2026

## Pedidos interpretados × status

| Pedido | Status |
|--------|--------|
| Avaliações separadas por área (Fono: Linguagem, Fonologia, Dicção, Miofuncional…) | **Feito** — hub com âncoras por área + especialidades |
| Anamnese por área (não geral) + Musicoterapia | **Feito** — formulário completo de Musicoterapia |
| Somente tabela Ashworth modificada | **Feito** — `/dashboard/avaliacoes/ashworth` |
| POP Psicomotora | **Feito** — `/dashboard/avaliacoes/pop` |
| PBS (Pediatric Balance Scale) | **Feito** — `/dashboard/avaliacoes/pbs` |
| Status de agenda ABA + convencional | **Já no UI**; script SQL `supabase/apply-appointment-statuses.sql` se o banco rejeitar |
| Biblioteca de modelos — incluir modelos | **Feito** — botão **Incluir modelo** + permissão ampliada |
| DEMUCA — gráficos | **Corrigido** — Recharts + mensagem quando parcial |
| Cargo Fonoaudióloga / aliases | **Corrigido** — mapeamento de área clínica |
| GMFM-88 | **Pendente** (instrumento grande; próximo sprint) |
| Figuras ABFW | Estímulos visuais — ABFW já tem formulário; assets opcionais depois |

## SQL a rodar no Supabase (se ainda não rodou)

1. `supabase/apply-care-modalities.sql`
2. `supabase/apply-appointment-statuses.sql`
3. Migration `20260902120000_fisio_assessment_templates.sql` (ou `supabase db push`)
