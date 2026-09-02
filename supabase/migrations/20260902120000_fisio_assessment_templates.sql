-- Templates de avaliação Fisio / Psicomotora (Ashworth, POP, PBS)

insert into public.assessment_templates (id, name, description, evaluation_type, status, created_at)
values
  (
    'b1000019-0000-4000-8000-000000000019',
    'Escala de Ashworth Modificada',
    'Tabela da Escala Modificada de Ashworth para espasticidade / tônus muscular.',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000020-0000-4000-8000-000000000020',
    'POP — Protocolo de Observação Psicomotora',
    'Protocolo de Observação Psicomotora — motricidade, praxias e vínculo.',
    'acquisition',
    'active',
    now()
  ),
  (
    'b1000021-0000-4000-8000-000000000021',
    'Pediatric Balance Scale (PBS)',
    'Escala pediátrica de equilíbrio (14 itens, máximo 56).',
    'acquisition',
    'active',
    now()
  )
on conflict (id) do nothing;
